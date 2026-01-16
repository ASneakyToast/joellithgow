/**
 * Manager Factory for Background Studio
 * Creates pattern-specific managers programmatically for layered composition
 * Supports both WebGL (Three.js) and p5.js renderers
 */

import { PatternBackgroundManager } from '../patterns/PatternBackgroundManager';
import { P5PatternManager } from '../patterns/p5/P5PatternManager';
import { createFBMUniforms } from '../patterns/shaders/uniforms';
import type { PatternType } from '../patterns/types';
import type { LayerPatternConfig } from '../patterns/types';
import { PATTERN_DEFAULTS, isP5Pattern } from '../patterns/registry';

// Import noise fragment shaders
import { perlinFragmentShader } from '../patterns/shaders/fragments/noise/perlin.glsl';
import { simplexFragmentShader } from '../patterns/shaders/fragments/noise/simplex.glsl';
import { worleyFragmentShader } from '../patterns/shaders/fragments/noise/worley.glsl';
import { voronoiEdgeFragmentShader } from '../patterns/shaders/fragments/noise/voronoi-edge.glsl';
import { turbulenceFragmentShader } from '../patterns/shaders/fragments/noise/turbulence.glsl';
import { ridgedFragmentShader } from '../patterns/shaders/fragments/noise/ridged.glsl';
import { domainWarpFragmentShader } from '../patterns/shaders/fragments/noise/domain-warp.glsl';
import { causticsFragmentShader } from '../patterns/shaders/fragments/noise/caustics.glsl';
import { marbleFragmentShader } from '../patterns/shaders/fragments/noise/marble.glsl';

// Import p5.js pattern managers
import { ConstellationP5Manager } from '../patterns/p5/patterns/constellation.p5';
import { BlueprintP5Manager } from '../patterns/p5/patterns/blueprint.p5';
import { FloatingShapesP5Manager } from '../patterns/p5/patterns/floating-shapes.p5';
import { MinimalLinesP5Manager } from '../patterns/p5/patterns/minimal-lines.p5';

// Backward compat alias
type NoiseType = PatternType;

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
class PerlinManager extends PatternBackgroundManager<StudioManagerConfig> {
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
class SimplexManager extends PatternBackgroundManager<StudioManagerConfig> {
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
class WorleyManager extends PatternBackgroundManager<StudioManagerConfig> {
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
class VoronoiEdgeManager extends PatternBackgroundManager<StudioManagerConfig> {
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
class TurbulenceManager extends PatternBackgroundManager<StudioManagerConfig> {
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
class RidgedManager extends PatternBackgroundManager<StudioManagerConfig> {
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
class DomainWarpManager extends PatternBackgroundManager<StudioManagerConfig> {
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
class CausticsManager extends PatternBackgroundManager<StudioManagerConfig> {
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
class MarbleManager extends PatternBackgroundManager<StudioManagerConfig> {
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
 * WebGL Manager class map (noise patterns)
 */
const WEBGL_MANAGER_CLASSES: Record<string, typeof PatternBackgroundManager<StudioManagerConfig>> = {
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
 * p5.js Manager class map (geometric patterns)
 */
const P5_MANAGER_CLASSES: Record<string, typeof P5PatternManager<any>> = {
  floatingShapes: FloatingShapesP5Manager,
  constellation: ConstellationP5Manager,
  minimalLines: MinimalLinesP5Manager,
  blueprint: BlueprintP5Manager
};

/**
 * Union type for all pattern managers
 */
export type AnyPatternManager =
  | PatternBackgroundManager<StudioManagerConfig>
  | P5PatternManager<any>;

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

  // Add noise pattern-specific attributes
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

  // Add geometric pattern-specific attributes (p5.js patterns)
  // Constellation
  if (config.starCount !== undefined) attrs['data-star-count'] = String(config.starCount);
  if (config.pointSize !== undefined) attrs['data-point-size'] = String(config.pointSize);
  if (config.connectionDistance !== undefined) attrs['data-connection-distance'] = String(config.connectionDistance);
  if (config.lineThickness !== undefined) attrs['data-line-thickness'] = String(config.lineThickness);
  if (config.lineFalloff !== undefined) attrs['data-line-falloff'] = String(config.lineFalloff);
  if (config.twinkleIntensity !== undefined) attrs['data-twinkle-intensity'] = String(config.twinkleIntensity);
  if (config.driftSpeed !== undefined) attrs['data-drift-speed'] = String(config.driftSpeed);
  // Blueprint
  if (config.elementDensity !== undefined) attrs['data-element-density'] = String(config.elementDensity);
  if (config.dimensionLength !== undefined) attrs['data-dimension-length'] = String(config.dimensionLength);
  if (config.markerSize !== undefined) attrs['data-marker-size'] = String(config.markerSize);
  if (config.bracketSize !== undefined) attrs['data-bracket-size'] = String(config.bracketSize);
  if (config.bracketRatio !== undefined) attrs['data-bracket-ratio'] = String(config.bracketRatio);
  if (config.tickDensity !== undefined) attrs['data-tick-density'] = String(config.tickDensity);
  // Floating Shapes
  if (config.shapeDensity !== undefined) attrs['data-shape-density'] = String(config.shapeDensity);
  if (config.shapeSize !== undefined) attrs['data-shape-size'] = String(config.shapeSize);
  if (config.sizeVariation !== undefined) attrs['data-size-variation'] = String(config.sizeVariation);
  if (config.shapeMix !== undefined) attrs['data-shape-mix'] = String(config.shapeMix);
  if (config.edgeSoftness !== undefined) attrs['data-edge-softness'] = String(config.edgeSoftness);
  if (config.rotationSpeed !== undefined) attrs['data-rotation-speed'] = String(config.rotationSpeed);
  // Minimal Lines
  if (config.lineDensity !== undefined) attrs['data-line-density'] = String(config.lineDensity);
  if (config.lineLength !== undefined) attrs['data-line-length'] = String(config.lineLength);
  if (config.lengthVariation !== undefined) attrs['data-length-variation'] = String(config.lengthVariation);
  if (config.angleVariation !== undefined) attrs['data-angle-variation'] = String(config.angleVariation);
  if (config.baseAngle !== undefined) attrs['data-base-angle'] = String(config.baseAngle);
  if (config.crosshatchChance !== undefined) attrs['data-crosshatch-chance'] = String(config.crosshatchChance);
  if (config.fillRatio !== undefined) attrs['data-fill-ratio'] = String(config.fillRatio);

  return attrs;
}

/**
 * Create a container element for a pattern layer
 * Automatically selects WebGL or p5.js container based on pattern type
 */
export function createLayerContainer(
  layerId: string,
  patternType: NoiseType,
  config: LayerPatternConfig,
  zIndex: number
): HTMLDivElement {
  const isP5 = isP5Pattern(patternType);
  const container = document.createElement('div');
  container.className = `${isP5 ? 'p5' : 'webgl'}-background-container ${isP5 ? '' : 'noise-texture '}layer-canvas layer-${patternType}`;
  container.id = `layer-${layerId}`;
  container.setAttribute('aria-hidden', 'true');
  container.style.zIndex = String(zIndex);

  // Set data attributes from config
  const attrs = configToDataAttributes(config);
  for (const [key, value] of Object.entries(attrs)) {
    container.setAttribute(key, value);
  }

  // Create canvas with appropriate class
  // Note: p5.js will create its own canvas, so we don't add one for p5 patterns
  if (!isP5) {
    const canvas = document.createElement('canvas');
    canvas.className = 'webgl-canvas';
    container.appendChild(canvas);
  }

  return container;
}

/**
 * Create a pattern manager for a layer
 * Automatically selects WebGL or p5.js manager based on pattern type
 */
export function createPatternManager(
  container: HTMLElement,
  patternType: NoiseType
): AnyPatternManager {
  // Check if this is a p5.js pattern
  if (isP5Pattern(patternType)) {
    const P5ManagerClass = P5_MANAGER_CLASSES[patternType];
    if (!P5ManagerClass) {
      throw new Error(`Unknown p5.js pattern type: ${patternType}`);
    }
    return new P5ManagerClass(container);
  }

  // Otherwise, use WebGL manager
  const WebGLManagerClass = WEBGL_MANAGER_CLASSES[patternType];
  if (!WebGLManagerClass) {
    throw new Error(`Unknown WebGL pattern type: ${patternType}`);
  }
  return new WebGLManagerClass(container);
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
export { PatternBackgroundManager };
