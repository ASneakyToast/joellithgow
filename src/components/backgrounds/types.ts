/**
 * WebGL Background Component Types
 * Shared interfaces for animated background components
 */

export interface WebGLBackgroundColors {
  primary?: string;
  secondary?: string;
  tertiary?: string;
}

export interface WebGLBackgroundProps {
  /** Animation speed multiplier (0.0 - 2.0, default: 1.0) */
  speed?: number;
  /** Effect intensity (0.0 - 1.0, default: 0.5) */
  intensity?: number;
  /** Override colors - uses theme CSS variables if not provided */
  colors?: WebGLBackgroundColors;
  /** Pixel ratio cap for performance (default: 2) */
  maxPixelRatio?: number;
  /** Whether to pause when off-screen (default: true) */
  pauseOffscreen?: boolean;
  /** Custom CSS class for the container */
  class?: string;
  /** Unique identifier for this instance */
  id?: string;
}

export interface GeometricGridProps extends WebGLBackgroundProps {
  /** Grid cell size in pixels (default: 80) */
  gridSize?: number;
  /** Line thickness in pixels (default: 1) */
  lineWidth?: number;
  /** Animation type (default: 'drift') */
  animationType?: 'drift' | 'pulse' | 'wave';
}

/** Available noise algorithms */
export type NoiseType =
  // Basic noise
  | 'perlin'      // Classic gradient noise
  | 'simplex'     // Optimized gradient noise
  | 'worley'      // Cellular/voronoi distance
  // Advanced noise
  | 'voronoiEdge' // Cell boundaries/cracks
  | 'turbulence'  // Billowy clouds/smoke
  | 'ridged'      // Mountain ridges/lightning
  | 'domainWarp'  // Fluid distortion
  | 'caustics'    // Underwater light patterns
  | 'marble';     // Stone veins/wood grain

/** Patterns that use Fractal Brownian Motion (FBM) */
export const FBM_PATTERNS: NoiseType[] = [
  'perlin', 'simplex', 'turbulence', 'ridged', 'marble'
];

/** Check if a pattern supports FBM parameters */
export function supportsFBM(noiseType: NoiseType): boolean {
  return FBM_PATTERNS.includes(noiseType);
}

/** FBM (Fractal Brownian Motion) parameters - shared across FBM patterns */
export interface FBMParams {
  /** Number of noise octaves (1-8, default: 4) */
  octaves?: number;
  /** Frequency multiplier per octave (1.5-3.5, default: 2.0) */
  lacunarity?: number;
  /** Amplitude multiplier per octave (0.3-0.7, default: 0.5) */
  gain?: number;
}

/** Perlin/Simplex specific parameters */
export interface PerlinSimplexParams {
  /** X-axis animation variation (0.1-2.0, default: 1.0) */
  timeScaleX?: number;
  /** Y-axis animation variation (0.1-2.0, default: 0.7) */
  timeScaleY?: number;
}

/** Worley noise specific parameters */
export interface WorleyParams {
  /** Cell size/count scaling (0.5-5.0, default: 2.0) */
  cellScale?: number;
  /** Cell point animation rate (0.0-1.0, default: 0.3) */
  cellAnimSpeed?: number;
  /** Invert distance (cells vs voids, default: true) */
  invert?: boolean;
}

/** Voronoi Edge specific parameters */
export interface VoronoiEdgeParams {
  /** Cell size scaling (0.5-5.0, default: 2.0) */
  cellScale?: number;
  /** Edge line thickness (0.05-0.5, default: 0.15) */
  edgeThickness?: number;
  /** Cell point animation rate (0.0-1.0, default: 0.2) */
  cellAnimSpeed?: number;
}

/** Turbulence specific parameters */
export interface TurbulenceParams {
  /** Edge contrast strength (0.5-2.0, default: 1.0) */
  sharpness?: number;
}

/** Ridged multifractal specific parameters */
export interface RidgedParams {
  /** Ridge peak sharpness/power (1.0-4.0, default: 2.0) */
  ridgeSharpness?: number;
  /** Animation speed multiplier (0.1-2.0, default: 0.5) */
  ridgeTimeScale?: number;
}

/** Domain Warp specific parameters */
export interface DomainWarpParams {
  /** Coordinate displacement amount (1.0-8.0, default: 4.0) */
  warpStrength?: number;
  /** Warp iteration depth (1-3, default: 2) */
  warpLayers?: number;
}

/** Caustics specific parameters */
export interface CausticsParams {
  /** Number of wave directions (1-6, default: 3) */
  waveCount?: number;
  /** Wave pattern density (4.0-16.0, default: 8.0) */
  waveFrequency?: number;
  /** Highlight intensity/power (1.0-3.0, default: 1.5) */
  waveSharpness?: number;
  /** Fine detail blend amount (0.0-0.3, default: 0.15) */
  detailAmount?: number;
}

/** Marble specific parameters */
export interface MarbleParams {
  /** Vein density (2.0-16.0, default: 8.0) */
  lineFrequency?: number;
  /** Vein distortion amount (2.0-12.0, default: 6.0) */
  noiseInfluence?: number;
  /** Secondary pattern mix (0.0-1.0, default: 0.3) */
  detailBlend?: number;
}

/** All pattern-specific parameters combined */
export type PatternSpecificParams =
  | PerlinSimplexParams
  | WorleyParams
  | VoronoiEdgeParams
  | TurbulenceParams
  | RidgedParams
  | DomainWarpParams
  | CausticsParams
  | MarbleParams;

export interface NoiseTextureProps extends WebGLBackgroundProps {
  /** Noise scale / detail level (default: 2.0) */
  noiseScale?: number;
  /** Noise algorithm to use (default: 'simplex') */
  noiseType?: NoiseType;
  /** Whether to animate the noise (default: true) */
  animated?: boolean;
  /** Animation direction in degrees (0-360, default: 315 for down-left) */
  animationAngle?: number;

  // FBM parameters (for applicable patterns)
  /** Number of noise octaves (1-8, default: 4) */
  octaves?: number;
  /** Frequency multiplier per octave (1.5-3.5, default: 2.0) */
  lacunarity?: number;
  /** Amplitude multiplier per octave (0.3-0.7, default: 0.5) */
  gain?: number;

  // Perlin/Simplex parameters
  /** X-axis animation variation (0.1-2.0) */
  timeScaleX?: number;
  /** Y-axis animation variation (0.1-2.0) */
  timeScaleY?: number;

  // Worley/Voronoi parameters
  /** Cell size/count scaling (0.5-5.0) */
  cellScale?: number;
  /** Cell point animation rate (0.0-1.0) */
  cellAnimSpeed?: number;
  /** Invert distance for Worley (cells vs voids) */
  invert?: boolean;
  /** Edge line thickness for Voronoi Edge (0.05-0.5) */
  edgeThickness?: number;

  // Turbulence parameters
  /** Edge contrast strength (0.5-2.0) */
  sharpness?: number;

  // Ridged parameters
  /** Ridge peak sharpness/power (1.0-4.0) */
  ridgeSharpness?: number;
  /** Ridge animation speed multiplier (0.1-2.0) */
  ridgeTimeScale?: number;

  // Domain Warp parameters
  /** Coordinate displacement amount (1.0-8.0) */
  warpStrength?: number;
  /** Warp iteration depth (1-3) */
  warpLayers?: number;

  // Caustics parameters
  /** Number of wave directions (1-6) */
  waveCount?: number;
  /** Wave pattern density (4.0-16.0) */
  waveFrequency?: number;
  /** Highlight intensity/power (1.0-3.0) */
  waveSharpness?: number;
  /** Fine detail blend amount (0.0-0.3) */
  detailAmount?: number;

  // Marble parameters
  /** Vein density (2.0-16.0) */
  lineFrequency?: number;
  /** Vein distortion amount (2.0-12.0) */
  noiseInfluence?: number;
  /** Secondary pattern mix (0.0-1.0) */
  detailBlend?: number;
}
