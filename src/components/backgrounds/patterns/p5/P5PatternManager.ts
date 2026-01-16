/**
 * Base manager class for all p5.js background patterns
 * Handles p5.js instance mode setup, animation loop, visibility observers, and cleanup
 * Pattern-specific components extend this and provide their own draw logic
 */

import p5 from 'p5';
import type { BasePatternConfig, ColorsConfig } from '../shaders/uniforms';

export interface P5PatternManagerConfig extends BasePatternConfig {
  [key: string]: unknown;
}

/**
 * Abstract base class for p5.js background pattern managers
 * Subclasses must implement:
 * - setup(p: p5): void
 * - draw(p: p5): void
 * - parsePatternConfig(container): Partial<TConfig>
 * - updatePatternConfig(props): void
 */
export abstract class P5PatternManager<TConfig extends P5PatternManagerConfig = P5PatternManagerConfig> {
  protected container: HTMLElement;
  protected canvas: HTMLCanvasElement | null = null;
  protected p5Instance: p5 | null = null;
  protected config: TConfig;
  protected prefersReducedMotion: boolean;
  protected isVisible: boolean = true;
  protected isPaused: boolean = false;
  protected resizeHandler: () => void;
  protected visibilityHandler: () => void;
  protected intersectionObserver: IntersectionObserver | null = null;
  protected startTime: number = 0;

  /** Subclasses must implement setup */
  protected abstract setup(p: p5): void;

  /** Subclasses must implement draw loop */
  protected abstract draw(p: p5): void;

  /** Subclasses must parse pattern-specific config from data attributes */
  protected abstract parsePatternConfig(container: HTMLElement): Partial<TConfig>;

  /** Subclasses must handle pattern-specific config updates */
  protected abstract updatePatternConfig(props: Partial<TConfig>): void;

  constructor(container: HTMLElement) {
    this.container = container;

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

    // Create p5 instance in instance mode
    this.p5Instance = new p5((p: p5) => {
      p.setup = () => {
        // Create canvas that fills the container
        const canvas = p.createCanvas(
          this.container.clientWidth,
          this.container.clientHeight
        );
        canvas.parent(this.container);
        this.canvas = canvas.elt as HTMLCanvasElement;
        this.canvas.classList.add('p5-canvas');

        // Set up p5 defaults
        p.pixelDensity(Math.min(window.devicePixelRatio, this.config.maxPixelRatio));

        this.startTime = p.millis();

        // Call pattern-specific setup
        this.setup(p);
      };

      p.draw = () => {
        if (!this.isVisible || this.isPaused || this.prefersReducedMotion) {
          return;
        }
        if (!this.config.animated) {
          return;
        }
        this.draw(p);
      };

      p.windowResized = () => this.onResize();
    }, this.container);

    this.setupVisibilityObservers();
    window.addEventListener('resize', this.resizeHandler);
  }

  protected setupVisibilityObservers(): void {
    if (this.config.pauseOffscreen) {
      this.intersectionObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            this.isVisible = entry.isIntersecting;
            if (this.p5Instance) {
              if (!entry.isIntersecting) {
                this.p5Instance.noLoop();
              } else {
                this.p5Instance.loop();
              }
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
      if (this.prefersReducedMotion && this.p5Instance) {
        this.p5Instance.noLoop();
      }
    });
  }

  protected onVisibilityChange(): void {
    this.isPaused = document.hidden;
    if (this.p5Instance) {
      if (this.isPaused) {
        this.p5Instance.noLoop();
      } else if (this.isVisible) {
        this.p5Instance.loop();
      }
    }
  }

  protected onResize(): void {
    if (!this.p5Instance) return;
    this.p5Instance.resizeCanvas(
      this.container.clientWidth,
      this.container.clientHeight
    );
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

  protected hexToRgb(hex: string): { r: number; g: number; b: number } {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 255, g: 107, b: 107 };
  }

  /** Get elapsed time in seconds */
  protected getElapsedTime(): number {
    if (!this.p5Instance) return 0;
    return (this.p5Instance.millis() - this.startTime) / 1000;
  }

  /**
   * Update config in real-time without re-rendering
   * Used by PropertiesPanel for live editing
   */
  updateUniforms(props: Partial<TConfig> & {
    colors?: ColorsConfig;
  }): void {
    // Update base config
    if (props.speed !== undefined) {
      this.config.speed = props.speed;
    }

    if (props.intensity !== undefined) {
      this.config.intensity = props.intensity;
    }

    if (props.noiseScale !== undefined) {
      this.config.noiseScale = props.noiseScale;
    }

    if (props.animated !== undefined) {
      this.config.animated = props.animated;
      if (this.p5Instance) {
        if (props.animated) {
          this.p5Instance.loop();
        } else {
          this.p5Instance.noLoop();
        }
      }
    }

    if (props.animationAngle !== undefined) {
      this.config.animationAngle = props.animationAngle;
    }

    if (props.colors) {
      if (props.colors.primary) {
        this.config.colors.primary = props.colors.primary;
      }
      if (props.colors.secondary) {
        this.config.colors.secondary = props.colors.secondary;
      }
      if (props.colors.tertiary) {
        this.config.colors.tertiary = props.colors.tertiary;
      }
    }

    // Call pattern-specific config updates
    this.updatePatternConfig(props);
  }

  /** Get current config for serialization */
  getConfig(): TConfig {
    return { ...this.config };
  }

  destroy(): void {
    window.removeEventListener('resize', this.resizeHandler);
    document.removeEventListener('visibilitychange', this.visibilityHandler);
    this.intersectionObserver?.disconnect();

    if (this.p5Instance) {
      this.p5Instance.remove();
      this.p5Instance = null;
    }

    this.canvas = null;
  }
}
