/**
 * Background Studio Types
 * Interfaces for multi-layer background composition
 */

import type { NoiseType, WebGLBackgroundColors } from '../types';

/**
 * CSS blend modes for layer compositing
 */
export type BlendMode =
  | 'normal'
  | 'multiply'
  | 'screen'
  | 'overlay'
  | 'darken'
  | 'lighten'
  | 'color-dodge'
  | 'color-burn'
  | 'hard-light'
  | 'soft-light'
  | 'difference'
  | 'exclusion';

/**
 * Available blend modes for the dropdown
 */
export const BLEND_MODES: { value: BlendMode; label: string }[] = [
  { value: 'normal', label: 'Normal' },
  { value: 'multiply', label: 'Multiply' },
  { value: 'screen', label: 'Screen' },
  { value: 'overlay', label: 'Overlay' },
  { value: 'darken', label: 'Darken' },
  { value: 'lighten', label: 'Lighten' },
  { value: 'color-dodge', label: 'Color Dodge' },
  { value: 'color-burn', label: 'Color Burn' },
  { value: 'hard-light', label: 'Hard Light' },
  { value: 'soft-light', label: 'Soft Light' },
  { value: 'difference', label: 'Difference' },
  { value: 'exclusion', label: 'Exclusion' },
];

/**
 * Configuration for a single layer in the studio
 */
export interface LayerConfig {
  /** Unique identifier for this layer */
  id: string;
  /** Pattern type for this layer */
  patternType: NoiseType;
  /** Stack order (higher = on top) */
  zIndex: number;
  /** Layer display name (auto-generated or user-set) */
  name: string;
  /** All pattern configuration values */
  config: LayerPatternConfig;
}

/**
 * Pattern configuration that can be applied to any layer
 * Combines all general and pattern-specific parameters
 */
export interface LayerPatternConfig {
  // General parameters (all patterns)
  speed: number;
  intensity: number;
  noiseScale: number;
  animated: boolean;
  animationAngle: number;
  colors: Required<WebGLBackgroundColors>;

  // Layer compositing (studio mode)
  opacity: number;
  blendMode: BlendMode;

  // FBM parameters (perlin, simplex, turbulence, ridged, marble)
  octaves?: number;
  lacunarity?: number;
  gain?: number;

  // Perlin/Simplex specific
  timeScaleX?: number;
  timeScaleY?: number;

  // Worley specific
  cellScale?: number;
  cellAnimSpeed?: number;
  invert?: boolean;

  // Voronoi Edge specific
  edgeThickness?: number;

  // Turbulence specific
  sharpness?: number;

  // Ridged specific
  ridgeSharpness?: number;
  ridgeTimeScale?: number;

  // Domain Warp specific
  warpStrength?: number;
  warpLayers?: number;

  // Caustics specific
  waveCount?: number;
  waveFrequency?: number;
  waveSharpness?: number;
  detailAmount?: number;

  // Marble specific
  lineFrequency?: number;
  noiseInfluence?: number;
  detailBlend?: number;
}

/**
 * Default configurations for each pattern type
 */
export const PATTERN_DEFAULTS: Record<NoiseType, LayerPatternConfig> = {
  perlin: {
    speed: 0.5,
    intensity: 0.6,
    noiseScale: 2.0,
    animated: true,
    animationAngle: 315,
    colors: { primary: '#FF6B6B', secondary: '#4ECDC4', tertiary: '#FFE66D' },
    opacity: 1,
    blendMode: 'normal',
    octaves: 4,
    lacunarity: 2.0,
    gain: 0.5,
    timeScaleX: 1.0,
    timeScaleY: 0.7
  },
  simplex: {
    speed: 0.4,
    intensity: 0.5,
    noiseScale: 3.0,
    animated: true,
    animationAngle: 315,
    colors: { primary: '#FF6B6B', secondary: '#4ECDC4', tertiary: '#FFE66D' },
    opacity: 1,
    blendMode: 'normal',
    octaves: 5,
    lacunarity: 2.0,
    gain: 0.5,
    timeScaleX: 0.8,
    timeScaleY: 1.0
  },
  worley: {
    speed: 0.3,
    intensity: 0.5,
    noiseScale: 1.5,
    animated: true,
    animationAngle: 315,
    colors: { primary: '#FF6B6B', secondary: '#4ECDC4', tertiary: '#FFE66D' },
    opacity: 1,
    blendMode: 'normal',
    cellScale: 2.0,
    cellAnimSpeed: 0.3,
    invert: true
  },
  voronoiEdge: {
    speed: 0.4,
    intensity: 0.6,
    noiseScale: 2.0,
    animated: true,
    animationAngle: 315,
    colors: { primary: '#FF6B6B', secondary: '#4ECDC4', tertiary: '#FFE66D' },
    opacity: 1,
    blendMode: 'normal',
    cellScale: 2.0,
    edgeThickness: 0.15,
    cellAnimSpeed: 0.2
  },
  turbulence: {
    speed: 0.5,
    intensity: 0.55,
    noiseScale: 2.5,
    animated: true,
    animationAngle: 315,
    colors: { primary: '#FF6B6B', secondary: '#4ECDC4', tertiary: '#FFE66D' },
    opacity: 1,
    blendMode: 'normal',
    octaves: 5,
    lacunarity: 2.0,
    gain: 0.5,
    sharpness: 1.0
  },
  ridged: {
    speed: 0.4,
    intensity: 0.6,
    noiseScale: 2.0,
    animated: true,
    animationAngle: 315,
    colors: { primary: '#FF6B6B', secondary: '#4ECDC4', tertiary: '#FFE66D' },
    opacity: 1,
    blendMode: 'normal',
    octaves: 5,
    lacunarity: 2.0,
    gain: 0.5,
    ridgeSharpness: 2.0,
    ridgeTimeScale: 0.5
  },
  domainWarp: {
    speed: 0.3,
    intensity: 0.5,
    noiseScale: 1.5,
    animated: true,
    animationAngle: 315,
    colors: { primary: '#FF6B6B', secondary: '#4ECDC4', tertiary: '#FFE66D' },
    opacity: 1,
    blendMode: 'normal',
    warpStrength: 4.0,
    warpLayers: 2
  },
  caustics: {
    speed: 0.6,
    intensity: 0.55,
    noiseScale: 1.8,
    animated: true,
    animationAngle: 315,
    colors: { primary: '#FF6B6B', secondary: '#4ECDC4', tertiary: '#FFE66D' },
    opacity: 1,
    blendMode: 'normal',
    waveCount: 3,
    waveFrequency: 8.0,
    waveSharpness: 1.5,
    detailAmount: 0.15
  },
  marble: {
    speed: 0.3,
    intensity: 0.5,
    noiseScale: 2.0,
    animated: true,
    animationAngle: 315,
    colors: { primary: '#FF6B6B', secondary: '#4ECDC4', tertiary: '#FFE66D' },
    opacity: 1,
    blendMode: 'normal',
    octaves: 4,
    lacunarity: 2.0,
    gain: 0.5,
    lineFrequency: 8.0,
    noiseInfluence: 6.0,
    detailBlend: 0.3
  }
};

/**
 * Human-readable names for pattern types
 */
export const PATTERN_NAMES: Record<NoiseType, string> = {
  perlin: 'Perlin Noise',
  simplex: 'Simplex Noise',
  worley: 'Worley Noise',
  voronoiEdge: 'Voronoi Edge',
  turbulence: 'Turbulence',
  ridged: 'Ridged',
  domainWarp: 'Domain Warp',
  caustics: 'Caustics',
  marble: 'Marble'
};

/**
 * All available pattern types for the pattern picker
 */
export const PATTERN_LIST: NoiseType[] = [
  'perlin',
  'simplex',
  'worley',
  'voronoiEdge',
  'turbulence',
  'ridged',
  'domainWarp',
  'caustics',
  'marble'
];

/**
 * Event types emitted by LayerManager
 */
export interface LayerManagerEventMap {
  'layer-added': CustomEvent<LayerConfig>;
  'layer-removed': CustomEvent<string>;
  'layer-selected': CustomEvent<string | null>;
  'layer-updated': CustomEvent<{ id: string; config: Partial<LayerPatternConfig> }>;
  'layer-reordered': CustomEvent<{ id: string; newIndex: number }>;
  'layers-changed': CustomEvent<LayerConfig[]>;
}

/**
 * Generate a unique layer ID
 */
export function generateLayerId(): string {
  return `layer-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Generate a default layer name based on pattern type and count
 */
export function generateLayerName(patternType: NoiseType, existingNames: string[]): string {
  const baseName = PATTERN_NAMES[patternType];
  let count = 1;
  let name = baseName;

  while (existingNames.includes(name)) {
    count++;
    name = `${baseName} ${count}`;
  }

  return name;
}
