/**
 * Manager Factory for Background Studio
 * Creates pattern-specific managers programmatically for layered composition
 */

import { NoiseBackgroundManager } from '../noise/NoiseBackgroundManager';
import { createFBMUniforms } from '../noise/shaders/uniforms';
import type { NoiseType } from '../types';
import type { LayerPatternConfig } from './types';
import { PATTERN_DEFAULTS } from './types';

// Import all fragment shaders
import { perlinFragmentShader } from '../noise/shaders/fragments/perlin.glsl';
import { simplexFragmentShader } from '../noise/shaders/fragments/simplex.glsl';
import { worleyFragmentShader } from '../noise/shaders/fragments/worley.glsl';
import { voronoiEdgeFragmentShader } from '../noise/shaders/fragments/voronoi-edge.glsl';
import { turbulenceFragmentShader } from '../noise/shaders/fragments/turbulence.glsl';
import { ridgedFragmentShader } from '../noise/shaders/fragments/ridged.glsl';
import { domainWarpFragmentShader } from '../noise/shaders/fragments/domain-warp.glsl';
import { causticsFragmentShader } from '../noise/shaders/fragments/caustics.glsl';
import { marbleFragmentShader } from '../noise/shaders/fragments/marble.glsl';

/**
 * Extended config interface for studio managers
 * Includes all possible pattern-specific properties
 */
interface StudioManagerConfig {
  speed: number;
  intensity: number;
  noiseScale: number;
  animated: boolean;
  animationAngle: number;
  maxPixelRatio: number;
  pauseOffscreen: boolean;
  colors: Record<string, string>;
  // FBM
  octaves?: number;
  lacunarity?: number;
  gain?: number;
  // Perlin/Simplex
  timeScaleX?: number;
  timeScaleY?: number;
  // Worley
  cellScale?: number;
  cellAnimSpeed?: number;
  invert?: boolean;
  // Voronoi Edge
  edgeThickness?: number;
  // Turbulence
  sharpness?: number;
  // Ridged
  ridgeSharpness?: number;
  ridgeTimeScale?: number;
  // Domain Warp
  warpStrength?: number;
  warpLayers?: number;
  // Caustics
  waveCount?: number;
  waveFrequency?: number;
  waveSharpness?: number;
  detailAmount?: number;
  // Marble
  lineFrequency?: number;
  noiseInfluence?: number;
  detailBlend?: number;
}

/**
 * Perlin Background Manager
 */
class PerlinManager extends NoiseBackgroundManager<StudioManagerConfig> {
  protected getFragmentShader(): string {
    return perlinFragmentShader;
  }

  protected parsePatternConfig(container: HTMLElement): Partial<StudioManagerConfig> {
    return {
      octaves: parseInt(container.dataset.octaves || '4'),
      lacunarity: parseFloat(container.dataset.lacunarity || '2.0'),
      gain: parseFloat(container.dataset.gain || '0.5'),
      timeScaleX: parseFloat(container.dataset.timeScaleX || '1.0'),
      timeScaleY: parseFloat(container.dataset.timeScaleY || '0.7')
    };
  }

  protected createPatternUniforms() {
    return {
      ...createFBMUniforms({
        octaves: this.config.octaves || 4,
        lacunarity: this.config.lacunarity || 2.0,
        gain: this.config.gain || 0.5
      }),
      uTimeScaleX: { value: this.config.timeScaleX || 1.0 },
      uTimeScaleY: { value: this.config.timeScaleY || 0.7 }
    };
  }

  protected updatePatternUniforms(props: Partial<StudioManagerConfig>): void {
    if (!this.material) return;
    if (props.octaves !== undefined) {
      this.config.octaves = props.octaves;
      this.material.uniforms.uOctaves.value = props.octaves;
    }
    if (props.lacunarity !== undefined) {
      this.config.lacunarity = props.lacunarity;
      this.material.uniforms.uLacunarity.value = props.lacunarity;
    }
    if (props.gain !== undefined) {
      this.config.gain = props.gain;
      this.material.uniforms.uGain.value = props.gain;
    }
    if (props.timeScaleX !== undefined) {
      this.config.timeScaleX = props.timeScaleX;
      this.material.uniforms.uTimeScaleX.value = props.timeScaleX;
    }
    if (props.timeScaleY !== undefined) {
      this.config.timeScaleY = props.timeScaleY;
      this.material.uniforms.uTimeScaleY.value = props.timeScaleY;
    }
  }
}

/**
 * Simplex Background Manager
 */
class SimplexManager extends NoiseBackgroundManager<StudioManagerConfig> {
  protected getFragmentShader(): string {
    return simplexFragmentShader;
  }

  protected parsePatternConfig(container: HTMLElement): Partial<StudioManagerConfig> {
    return {
      octaves: parseInt(container.dataset.octaves || '5'),
      lacunarity: parseFloat(container.dataset.lacunarity || '2.0'),
      gain: parseFloat(container.dataset.gain || '0.5'),
      timeScaleX: parseFloat(container.dataset.timeScaleX || '0.8'),
      timeScaleY: parseFloat(container.dataset.timeScaleY || '1.0')
    };
  }

  protected createPatternUniforms() {
    return {
      ...createFBMUniforms({
        octaves: this.config.octaves || 5,
        lacunarity: this.config.lacunarity || 2.0,
        gain: this.config.gain || 0.5
      }),
      uTimeScaleX: { value: this.config.timeScaleX || 0.8 },
      uTimeScaleY: { value: this.config.timeScaleY || 1.0 }
    };
  }

  protected updatePatternUniforms(props: Partial<StudioManagerConfig>): void {
    if (!this.material) return;
    if (props.octaves !== undefined) {
      this.config.octaves = props.octaves;
      this.material.uniforms.uOctaves.value = props.octaves;
    }
    if (props.lacunarity !== undefined) {
      this.config.lacunarity = props.lacunarity;
      this.material.uniforms.uLacunarity.value = props.lacunarity;
    }
    if (props.gain !== undefined) {
      this.config.gain = props.gain;
      this.material.uniforms.uGain.value = props.gain;
    }
    if (props.timeScaleX !== undefined) {
      this.config.timeScaleX = props.timeScaleX;
      this.material.uniforms.uTimeScaleX.value = props.timeScaleX;
    }
    if (props.timeScaleY !== undefined) {
      this.config.timeScaleY = props.timeScaleY;
      this.material.uniforms.uTimeScaleY.value = props.timeScaleY;
    }
  }
}

/**
 * Worley Background Manager
 */
class WorleyManager extends NoiseBackgroundManager<StudioManagerConfig> {
  protected getFragmentShader(): string {
    return worleyFragmentShader;
  }

  protected parsePatternConfig(container: HTMLElement): Partial<StudioManagerConfig> {
    return {
      cellScale: parseFloat(container.dataset.cellScale || '2.0'),
      cellAnimSpeed: parseFloat(container.dataset.cellAnimSpeed || '0.3'),
      invert: container.dataset.invert !== 'false'
    };
  }

  protected createPatternUniforms() {
    return {
      uCellScale: { value: this.config.cellScale || 2.0 },
      uCellAnimSpeed: { value: this.config.cellAnimSpeed || 0.3 },
      uInvert: { value: this.config.invert !== false }
    };
  }

  protected updatePatternUniforms(props: Partial<StudioManagerConfig>): void {
    if (!this.material) return;
    if (props.cellScale !== undefined) {
      this.config.cellScale = props.cellScale;
      this.material.uniforms.uCellScale.value = props.cellScale;
    }
    if (props.cellAnimSpeed !== undefined) {
      this.config.cellAnimSpeed = props.cellAnimSpeed;
      this.material.uniforms.uCellAnimSpeed.value = props.cellAnimSpeed;
    }
    if (props.invert !== undefined) {
      this.config.invert = props.invert;
      this.material.uniforms.uInvert.value = props.invert;
    }
  }
}

/**
 * Voronoi Edge Background Manager
 */
class VoronoiEdgeManager extends NoiseBackgroundManager<StudioManagerConfig> {
  protected getFragmentShader(): string {
    return voronoiEdgeFragmentShader;
  }

  protected parsePatternConfig(container: HTMLElement): Partial<StudioManagerConfig> {
    return {
      cellScale: parseFloat(container.dataset.cellScale || '2.0'),
      edgeThickness: parseFloat(container.dataset.edgeThickness || '0.15'),
      cellAnimSpeed: parseFloat(container.dataset.cellAnimSpeed || '0.2')
    };
  }

  protected createPatternUniforms() {
    return {
      uCellScale: { value: this.config.cellScale || 2.0 },
      uEdgeThickness: { value: this.config.edgeThickness || 0.15 },
      uCellAnimSpeed: { value: this.config.cellAnimSpeed || 0.2 }
    };
  }

  protected updatePatternUniforms(props: Partial<StudioManagerConfig>): void {
    if (!this.material) return;
    if (props.cellScale !== undefined) {
      this.config.cellScale = props.cellScale;
      this.material.uniforms.uCellScale.value = props.cellScale;
    }
    if (props.edgeThickness !== undefined) {
      this.config.edgeThickness = props.edgeThickness;
      this.material.uniforms.uEdgeThickness.value = props.edgeThickness;
    }
    if (props.cellAnimSpeed !== undefined) {
      this.config.cellAnimSpeed = props.cellAnimSpeed;
      this.material.uniforms.uCellAnimSpeed.value = props.cellAnimSpeed;
    }
  }
}

/**
 * Turbulence Background Manager
 */
class TurbulenceManager extends NoiseBackgroundManager<StudioManagerConfig> {
  protected getFragmentShader(): string {
    return turbulenceFragmentShader;
  }

  protected parsePatternConfig(container: HTMLElement): Partial<StudioManagerConfig> {
    return {
      octaves: parseInt(container.dataset.octaves || '5'),
      lacunarity: parseFloat(container.dataset.lacunarity || '2.0'),
      gain: parseFloat(container.dataset.gain || '0.5'),
      sharpness: parseFloat(container.dataset.sharpness || '1.0')
    };
  }

  protected createPatternUniforms() {
    return {
      ...createFBMUniforms({
        octaves: this.config.octaves || 5,
        lacunarity: this.config.lacunarity || 2.0,
        gain: this.config.gain || 0.5
      }),
      uSharpness: { value: this.config.sharpness || 1.0 }
    };
  }

  protected updatePatternUniforms(props: Partial<StudioManagerConfig>): void {
    if (!this.material) return;
    if (props.octaves !== undefined) {
      this.config.octaves = props.octaves;
      this.material.uniforms.uOctaves.value = props.octaves;
    }
    if (props.lacunarity !== undefined) {
      this.config.lacunarity = props.lacunarity;
      this.material.uniforms.uLacunarity.value = props.lacunarity;
    }
    if (props.gain !== undefined) {
      this.config.gain = props.gain;
      this.material.uniforms.uGain.value = props.gain;
    }
    if (props.sharpness !== undefined) {
      this.config.sharpness = props.sharpness;
      this.material.uniforms.uSharpness.value = props.sharpness;
    }
  }
}

/**
 * Ridged Background Manager
 */
class RidgedManager extends NoiseBackgroundManager<StudioManagerConfig> {
  protected getFragmentShader(): string {
    return ridgedFragmentShader;
  }

  protected parsePatternConfig(container: HTMLElement): Partial<StudioManagerConfig> {
    return {
      octaves: parseInt(container.dataset.octaves || '5'),
      lacunarity: parseFloat(container.dataset.lacunarity || '2.0'),
      gain: parseFloat(container.dataset.gain || '0.5'),
      ridgeSharpness: parseFloat(container.dataset.ridgeSharpness || '2.0'),
      ridgeTimeScale: parseFloat(container.dataset.ridgeTimeScale || '0.5')
    };
  }

  protected createPatternUniforms() {
    return {
      ...createFBMUniforms({
        octaves: this.config.octaves || 5,
        lacunarity: this.config.lacunarity || 2.0,
        gain: this.config.gain || 0.5
      }),
      uRidgeSharpness: { value: this.config.ridgeSharpness || 2.0 },
      uRidgeTimeScale: { value: this.config.ridgeTimeScale || 0.5 }
    };
  }

  protected updatePatternUniforms(props: Partial<StudioManagerConfig>): void {
    if (!this.material) return;
    if (props.octaves !== undefined) {
      this.config.octaves = props.octaves;
      this.material.uniforms.uOctaves.value = props.octaves;
    }
    if (props.lacunarity !== undefined) {
      this.config.lacunarity = props.lacunarity;
      this.material.uniforms.uLacunarity.value = props.lacunarity;
    }
    if (props.gain !== undefined) {
      this.config.gain = props.gain;
      this.material.uniforms.uGain.value = props.gain;
    }
    if (props.ridgeSharpness !== undefined) {
      this.config.ridgeSharpness = props.ridgeSharpness;
      this.material.uniforms.uRidgeSharpness.value = props.ridgeSharpness;
    }
    if (props.ridgeTimeScale !== undefined) {
      this.config.ridgeTimeScale = props.ridgeTimeScale;
      this.material.uniforms.uRidgeTimeScale.value = props.ridgeTimeScale;
    }
  }
}

/**
 * Domain Warp Background Manager
 */
class DomainWarpManager extends NoiseBackgroundManager<StudioManagerConfig> {
  protected getFragmentShader(): string {
    return domainWarpFragmentShader;
  }

  protected parsePatternConfig(container: HTMLElement): Partial<StudioManagerConfig> {
    return {
      warpStrength: parseFloat(container.dataset.warpStrength || '4.0'),
      warpLayers: parseInt(container.dataset.warpLayers || '2')
    };
  }

  protected createPatternUniforms() {
    return {
      uWarpStrength: { value: this.config.warpStrength || 4.0 },
      uWarpLayers: { value: this.config.warpLayers || 2 }
    };
  }

  protected updatePatternUniforms(props: Partial<StudioManagerConfig>): void {
    if (!this.material) return;
    if (props.warpStrength !== undefined) {
      this.config.warpStrength = props.warpStrength;
      this.material.uniforms.uWarpStrength.value = props.warpStrength;
    }
    if (props.warpLayers !== undefined) {
      this.config.warpLayers = props.warpLayers;
      this.material.uniforms.uWarpLayers.value = props.warpLayers;
    }
  }
}

/**
 * Caustics Background Manager
 */
class CausticsManager extends NoiseBackgroundManager<StudioManagerConfig> {
  protected getFragmentShader(): string {
    return causticsFragmentShader;
  }

  protected parsePatternConfig(container: HTMLElement): Partial<StudioManagerConfig> {
    return {
      waveCount: parseInt(container.dataset.waveCount || '3'),
      waveFrequency: parseFloat(container.dataset.waveFrequency || '8.0'),
      waveSharpness: parseFloat(container.dataset.waveSharpness || '1.5'),
      detailAmount: parseFloat(container.dataset.detailAmount || '0.15')
    };
  }

  protected createPatternUniforms() {
    return {
      uWaveCount: { value: this.config.waveCount || 3 },
      uWaveFrequency: { value: this.config.waveFrequency || 8.0 },
      uWaveSharpness: { value: this.config.waveSharpness || 1.5 },
      uDetailAmount: { value: this.config.detailAmount || 0.15 }
    };
  }

  protected updatePatternUniforms(props: Partial<StudioManagerConfig>): void {
    if (!this.material) return;
    if (props.waveCount !== undefined) {
      this.config.waveCount = props.waveCount;
      this.material.uniforms.uWaveCount.value = props.waveCount;
    }
    if (props.waveFrequency !== undefined) {
      this.config.waveFrequency = props.waveFrequency;
      this.material.uniforms.uWaveFrequency.value = props.waveFrequency;
    }
    if (props.waveSharpness !== undefined) {
      this.config.waveSharpness = props.waveSharpness;
      this.material.uniforms.uWaveSharpness.value = props.waveSharpness;
    }
    if (props.detailAmount !== undefined) {
      this.config.detailAmount = props.detailAmount;
      this.material.uniforms.uDetailAmount.value = props.detailAmount;
    }
  }
}

/**
 * Marble Background Manager
 */
class MarbleManager extends NoiseBackgroundManager<StudioManagerConfig> {
  protected getFragmentShader(): string {
    return marbleFragmentShader;
  }

  protected parsePatternConfig(container: HTMLElement): Partial<StudioManagerConfig> {
    return {
      octaves: parseInt(container.dataset.octaves || '4'),
      lacunarity: parseFloat(container.dataset.lacunarity || '2.0'),
      gain: parseFloat(container.dataset.gain || '0.5'),
      lineFrequency: parseFloat(container.dataset.lineFrequency || '8.0'),
      noiseInfluence: parseFloat(container.dataset.noiseInfluence || '6.0'),
      detailBlend: parseFloat(container.dataset.detailBlend || '0.3')
    };
  }

  protected createPatternUniforms() {
    return {
      ...createFBMUniforms({
        octaves: this.config.octaves || 4,
        lacunarity: this.config.lacunarity || 2.0,
        gain: this.config.gain || 0.5
      }),
      uLineFrequency: { value: this.config.lineFrequency || 8.0 },
      uNoiseInfluence: { value: this.config.noiseInfluence || 6.0 },
      uDetailBlend: { value: this.config.detailBlend || 0.3 }
    };
  }

  protected updatePatternUniforms(props: Partial<StudioManagerConfig>): void {
    if (!this.material) return;
    if (props.octaves !== undefined) {
      this.config.octaves = props.octaves;
      this.material.uniforms.uOctaves.value = props.octaves;
    }
    if (props.lacunarity !== undefined) {
      this.config.lacunarity = props.lacunarity;
      this.material.uniforms.uLacunarity.value = props.lacunarity;
    }
    if (props.gain !== undefined) {
      this.config.gain = props.gain;
      this.material.uniforms.uGain.value = props.gain;
    }
    if (props.lineFrequency !== undefined) {
      this.config.lineFrequency = props.lineFrequency;
      this.material.uniforms.uLineFrequency.value = props.lineFrequency;
    }
    if (props.noiseInfluence !== undefined) {
      this.config.noiseInfluence = props.noiseInfluence;
      this.material.uniforms.uNoiseInfluence.value = props.noiseInfluence;
    }
    if (props.detailBlend !== undefined) {
      this.config.detailBlend = props.detailBlend;
      this.material.uniforms.uDetailBlend.value = props.detailBlend;
    }
  }
}

/**
 * Manager class map
 */
const MANAGER_CLASSES: Record<NoiseType, typeof NoiseBackgroundManager<StudioManagerConfig>> = {
  perlin: PerlinManager,
  simplex: SimplexManager,
  worley: WorleyManager,
  voronoiEdge: VoronoiEdgeManager,
  turbulence: TurbulenceManager,
  ridged: RidgedManager,
  domainWarp: DomainWarpManager,
  caustics: CausticsManager,
  marble: MarbleManager
};

/**
 * Convert LayerPatternConfig to data attributes for container element
 */
function configToDataAttributes(config: LayerPatternConfig): Record<string, string> {
  const attrs: Record<string, string> = {
    'data-speed': String(config.speed),
    'data-intensity': String(config.intensity),
    'data-noise-scale': String(config.noiseScale),
    'data-animated': String(config.animated),
    'data-animation-angle': String(config.animationAngle),
    'data-colors': JSON.stringify(config.colors),
    'data-max-pixel-ratio': '2',
    'data-pause-offscreen': 'true'
  };

  // Add pattern-specific attributes
  if (config.octaves !== undefined) attrs['data-octaves'] = String(config.octaves);
  if (config.lacunarity !== undefined) attrs['data-lacunarity'] = String(config.lacunarity);
  if (config.gain !== undefined) attrs['data-gain'] = String(config.gain);
  if (config.timeScaleX !== undefined) attrs['data-time-scale-x'] = String(config.timeScaleX);
  if (config.timeScaleY !== undefined) attrs['data-time-scale-y'] = String(config.timeScaleY);
  if (config.cellScale !== undefined) attrs['data-cell-scale'] = String(config.cellScale);
  if (config.cellAnimSpeed !== undefined) attrs['data-cell-anim-speed'] = String(config.cellAnimSpeed);
  if (config.invert !== undefined) attrs['data-invert'] = String(config.invert);
  if (config.edgeThickness !== undefined) attrs['data-edge-thickness'] = String(config.edgeThickness);
  if (config.sharpness !== undefined) attrs['data-sharpness'] = String(config.sharpness);
  if (config.ridgeSharpness !== undefined) attrs['data-ridge-sharpness'] = String(config.ridgeSharpness);
  if (config.ridgeTimeScale !== undefined) attrs['data-ridge-time-scale'] = String(config.ridgeTimeScale);
  if (config.warpStrength !== undefined) attrs['data-warp-strength'] = String(config.warpStrength);
  if (config.warpLayers !== undefined) attrs['data-warp-layers'] = String(config.warpLayers);
  if (config.waveCount !== undefined) attrs['data-wave-count'] = String(config.waveCount);
  if (config.waveFrequency !== undefined) attrs['data-wave-frequency'] = String(config.waveFrequency);
  if (config.waveSharpness !== undefined) attrs['data-wave-sharpness'] = String(config.waveSharpness);
  if (config.detailAmount !== undefined) attrs['data-detail-amount'] = String(config.detailAmount);
  if (config.lineFrequency !== undefined) attrs['data-line-frequency'] = String(config.lineFrequency);
  if (config.noiseInfluence !== undefined) attrs['data-noise-influence'] = String(config.noiseInfluence);
  if (config.detailBlend !== undefined) attrs['data-detail-blend'] = String(config.detailBlend);

  return attrs;
}

/**
 * Create a container element for a pattern layer
 */
export function createLayerContainer(
  layerId: string,
  patternType: NoiseType,
  config: LayerPatternConfig,
  zIndex: number
): HTMLDivElement {
  const container = document.createElement('div');
  container.className = `webgl-background-container noise-texture layer-canvas layer-${patternType}`;
  container.id = `layer-${layerId}`;
  container.setAttribute('aria-hidden', 'true');
  container.style.zIndex = String(zIndex);

  // Set data attributes from config
  const attrs = configToDataAttributes(config);
  for (const [key, value] of Object.entries(attrs)) {
    container.setAttribute(key, value);
  }

  // Create canvas
  const canvas = document.createElement('canvas');
  canvas.className = 'webgl-canvas';
  container.appendChild(canvas);

  return container;
}

/**
 * Create a pattern manager for a layer
 */
export function createPatternManager(
  container: HTMLElement,
  patternType: NoiseType
): NoiseBackgroundManager<StudioManagerConfig> {
  const ManagerClass = MANAGER_CLASSES[patternType];
  if (!ManagerClass) {
    throw new Error(`Unknown pattern type: ${patternType}`);
  }
  return new ManagerClass(container);
}

/**
 * Get default configuration for a pattern type
 */
export function getPatternDefaults(patternType: NoiseType): LayerPatternConfig {
  return { ...PATTERN_DEFAULTS[patternType] };
}

/**
 * Export manager classes for type checking
 */
export type { StudioManagerConfig };
export { NoiseBackgroundManager };
