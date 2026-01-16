/**
 * Base manager class for all WebGL background patterns
 * Handles Three.js setup, animation loop, visibility observers, and cleanup
 * Pattern-specific components extend this and provide their own uniforms + fragment shader
 */

import * as THREE from 'three';
import type { BasePatternConfig, ColorsConfig } from './shaders/uniforms';
import { createBaseUniforms } from './shaders/uniforms';
import { vertexShader } from './shaders/vertex.glsl';

export interface PatternBackgroundManagerConfig extends BasePatternConfig {
  [key: string]: unknown;
}

/** @deprecated Use PatternBackgroundManagerConfig instead */
export type NoiseBackgroundManagerConfig = PatternBackgroundManagerConfig;

/**
 * Abstract base class for WebGL background pattern managers
 * Subclasses must implement:
 * - getFragmentShader(): string
 * - createPatternUniforms(): Record<string, { value: unknown }>
 * - updatePatternUniforms(props): void
 * - parsePatternConfig(container): Partial<TConfig>
 */
export abstract class PatternBackgroundManager<TConfig extends PatternBackgroundManagerConfig = PatternBackgroundManagerConfig> {
  protected container: HTMLElement;
  protected canvas: HTMLCanvasElement;
  protected renderer: THREE.WebGLRenderer | null = null;
  protected scene: THREE.Scene | null = null;
  protected camera: THREE.OrthographicCamera | null = null;
  protected material: THREE.ShaderMaterial | null = null;
  protected animationId: number | null = null;
  protected isVisible: boolean = true;
  protected isPaused: boolean = false;
  protected clock: THREE.Clock | null = null;
  protected config: TConfig;
  protected prefersReducedMotion: boolean;
  protected resizeHandler: () => void;
  protected visibilityHandler: () => void;
  protected intersectionObserver: IntersectionObserver | null = null;

  /** Subclasses must provide the fragment shader */
  protected abstract getFragmentShader(): string;

  /** Subclasses must provide pattern-specific uniforms */
  protected abstract createPatternUniforms(): Record<string, { value: unknown }>;

  /** Subclasses must handle pattern-specific uniform updates */
  protected abstract updatePatternUniforms(props: Partial<TConfig>): void;

  /** Subclasses must parse pattern-specific config from data attributes */
  protected abstract parsePatternConfig(container: HTMLElement): Partial<TConfig>;

  constructor(container: HTMLElement) {
    this.container = container;
    this.canvas = container.querySelector('.webgl-canvas') as HTMLCanvasElement;

    // Parse base config
    const baseConfig = this.parseBaseConfig(container);
    // Parse pattern-specific config
    const patternConfig = this.parsePatternConfig(container);

    this.config = { ...baseConfig, ...patternConfig } as TConfig;

    this.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.resizeHandler = () => this.onResize();
    this.visibilityHandler = () => this.onVisibilityChange();
  }

  protected parseBaseConfig(container: HTMLElement): BasePatternConfig {
    return {
      speed: parseFloat(container.dataset.speed || '1'),
      intensity: parseFloat(container.dataset.intensity || '0.5'),
      noiseScale: parseFloat(container.dataset.noiseScale || '2'),
      animated: container.dataset.animated !== 'false',
      animationAngle: parseFloat(container.dataset.animationAngle || '315'),
      maxPixelRatio: parseFloat(container.dataset.maxPixelRatio || '2'),
      pauseOffscreen: container.dataset.pauseOffscreen !== 'false',
      colors: JSON.parse(container.dataset.colors || '{}')
    };
  }

  async init(): Promise<void> {
    if (this.prefersReducedMotion) {
      return;
    }

    if (!this.isWebGLSupported()) {
      console.warn('WebGL not supported');
      return;
    }

    this.setupRenderer();
    this.setupScene();
    this.setupCamera();
    this.setupMesh();
    this.setupVisibilityObservers();
    this.onResize();
    this.animate();

    window.addEventListener('resize', this.resizeHandler);
  }

  protected isWebGLSupported(): boolean {
    try {
      const canvas = document.createElement('canvas');
      return !!(window.WebGLRenderingContext &&
        (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
    } catch (e) {
      return false;
    }
  }

  protected setupRenderer(): void {
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      alpha: true,
      antialias: false,
      powerPreference: 'low-power'
    });

    const pixelRatio = Math.min(window.devicePixelRatio, this.config.maxPixelRatio);
    this.renderer.setPixelRatio(pixelRatio);
    this.renderer.setClearColor(0x000000, 0);
  }

  protected setupScene(): void {
    this.scene = new THREE.Scene();
    this.clock = new THREE.Clock();
  }

  protected setupCamera(): void {
    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
    this.camera.position.z = 1;
  }

  protected getCSSVariable(name: string): string {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  }

  protected getThemeColors(): { primary: string; secondary: string; tertiary: string } {
    return {
      primary: this.config.colors.primary || this.getCSSVariable('--accent-primary') || '#FF6B6B',
      secondary: this.config.colors.secondary || this.getCSSVariable('--accent-secondary') || '#4ECDC4',
      tertiary: this.config.colors.tertiary || this.getCSSVariable('--accent-tertiary') || '#FFE66D'
    };
  }

  protected setupMesh(): void {
    const themeColors = this.getThemeColors();
    const baseUniforms = createBaseUniforms(this.config, themeColors);
    const patternUniforms = this.createPatternUniforms();

    const fragmentShader = this.getFragmentShader();

    this.material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        ...baseUniforms,
        ...patternUniforms
      },
      transparent: true,
      depthWrite: false
    });

    // Check for shader compilation errors
    if (this.renderer) {
      const gl = this.renderer.getContext();
      const program = (this.material as any).program;
      if (program) {
        const vertShader = program.vertexShader;
        const fragShader = program.fragmentShader;

        if (vertShader && !gl.getShaderParameter(vertShader, gl.COMPILE_STATUS)) {
          console.error('Vertex shader error:', gl.getShaderInfoLog(vertShader));
        }
        if (fragShader && !gl.getShaderParameter(fragShader, gl.COMPILE_STATUS)) {
          console.error('Fragment shader error:', gl.getShaderInfoLog(fragShader));
          console.error('Fragment shader source:', fragmentShader);
        }
      }
    }

    const geometry = new THREE.PlaneGeometry(2, 2);
    const mesh = new THREE.Mesh(geometry, this.material);
    this.scene?.add(mesh);
  }

  protected setupVisibilityObservers(): void {
    if (this.config.pauseOffscreen) {
      this.intersectionObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            this.isVisible = entry.isIntersecting;
            // Pause rendering when not visible to save GPU resources
            if (!entry.isIntersecting && this.renderer) {
              this.renderer.setAnimationLoop(null);
            }
          });
        },
        { threshold: 0.1, rootMargin: '50px' }
      );
      this.intersectionObserver.observe(this.container);
    }

    document.addEventListener('visibilitychange', this.visibilityHandler);

    window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', (e) => {
      this.prefersReducedMotion = e.matches;
      if (this.prefersReducedMotion) {
        this.stopAnimation();
      }
    });
  }

  protected onVisibilityChange(): void {
    this.isPaused = document.hidden;
  }

  protected onResize(): void {
    if (!this.renderer || !this.material) return;

    const width = this.container.clientWidth;
    const height = this.container.clientHeight;

    this.renderer.setSize(width, height);
    this.material.uniforms.uResolution.value.set(width, height);
  }

  protected animate(): void {
    this.animationId = requestAnimationFrame(() => this.animate());

    if (!this.isVisible || this.isPaused || this.prefersReducedMotion) {
      return;
    }

    if (!this.renderer || !this.scene || !this.camera || !this.clock || !this.material) {
      return;
    }

    const elapsed = this.clock.getElapsedTime();
    this.material.uniforms.uTime.value = elapsed;

    this.renderer.render(this.scene, this.camera);
  }

  protected stopAnimation(): void {
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  /**
   * Update shader uniforms in real-time without re-rendering
   * Used by PropertiesPanel for live editing
   */
  updateUniforms(props: Partial<TConfig> & {
    colors?: ColorsConfig;
  }): void {
    if (!this.material) return;

    // Update base uniforms
    if (props.speed !== undefined) {
      this.config.speed = props.speed;
      this.material.uniforms.uSpeed.value = props.speed;
    }

    if (props.intensity !== undefined) {
      this.config.intensity = props.intensity;
      this.material.uniforms.uIntensity.value = props.intensity;
    }

    if (props.noiseScale !== undefined) {
      this.config.noiseScale = props.noiseScale;
      this.material.uniforms.uNoiseScale.value = props.noiseScale;
    }

    if (props.animated !== undefined) {
      this.config.animated = props.animated;
      this.material.uniforms.uAnimated.value = props.animated;
    }

    if (props.animationAngle !== undefined) {
      this.config.animationAngle = props.animationAngle;
      this.material.uniforms.uAnimationAngle.value = props.animationAngle;
    }

    if (props.colors) {
      if (props.colors.primary) {
        this.config.colors.primary = props.colors.primary;
        this.material.uniforms.uColorPrimary.value = new THREE.Color(props.colors.primary);
      }
      if (props.colors.secondary) {
        this.config.colors.secondary = props.colors.secondary;
        this.material.uniforms.uColorSecondary.value = new THREE.Color(props.colors.secondary);
      }
      if (props.colors.tertiary) {
        this.config.colors.tertiary = props.colors.tertiary;
        this.material.uniforms.uColorTertiary.value = new THREE.Color(props.colors.tertiary);
      }
    }

    // Call pattern-specific uniform updates
    this.updatePatternUniforms(props);
  }

  /** Get current config for serialization */
  getConfig(): TConfig {
    return { ...this.config };
  }

  destroy(): void {
    this.stopAnimation();
    window.removeEventListener('resize', this.resizeHandler);
    document.removeEventListener('visibilitychange', this.visibilityHandler);
    this.intersectionObserver?.disconnect();

    if (this.renderer) {
      this.renderer.dispose();
      this.renderer = null;
    }

    if (this.material) {
      this.material.dispose();
      this.material = null;
    }

    this.scene?.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        object.geometry?.dispose();
      }
    });

    this.scene = null;
    this.camera = null;
    this.clock = null;
  }
}

/** @deprecated Use PatternBackgroundManager instead */
export const NoiseBackgroundManager = PatternBackgroundManager;
