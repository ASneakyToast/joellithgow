/**
 * Type definitions for noise pattern components
 * Re-exports common types and defines pattern-specific component props
 */

// Re-export from parent types
export type {
  WebGLBackgroundColors,
  WebGLBackgroundProps,
  NoiseType,
  FBMParams,
  PerlinSimplexParams,
  WorleyParams,
  VoronoiEdgeParams,
  TurbulenceParams,
  RidgedParams,
  DomainWarpParams,
  CausticsParams,
  MarbleParams
} from '../types';

export { FBM_PATTERNS, supportsFBM } from '../types';

/** Base props shared by all noise pattern components */
export interface BaseNoiseBackgroundProps {
  /** Animation speed multiplier (0.0 - 2.0, default: 1.0) */
  speed?: number;
  /** Effect intensity (0.0 - 1.0, default: 0.5) */
  intensity?: number;
  /** Noise scale / detail level (default: 2.0) */
  noiseScale?: number;
  /** Whether to animate the noise (default: true) */
  animated?: boolean;
  /** Animation direction in degrees (0-360, default: 315 for down-left) */
  animationAngle?: number;
  /** Override colors - uses theme CSS variables if not provided */
  colors?: {
    primary?: string;
    secondary?: string;
    tertiary?: string;
  };
  /** Pixel ratio cap for performance (default: 2) */
  maxPixelRatio?: number;
  /** Whether to pause when off-screen (default: true) */
  pauseOffscreen?: boolean;
  /** Custom CSS class for the container */
  class?: string;
  /** Unique identifier for this instance */
  id?: string;
}

/** FBM parameters for patterns that support it */
export interface FBMBackgroundProps {
  /** Number of noise octaves (1-8, default: 4) */
  octaves?: number;
  /** Frequency multiplier per octave (1.5-3.5, default: 2.0) */
  lacunarity?: number;
  /** Amplitude multiplier per octave (0.3-0.7, default: 0.5) */
  gain?: number;
}

/** Props for SimplexBackground component */
export interface SimplexBackgroundProps extends BaseNoiseBackgroundProps, FBMBackgroundProps {
  /** X-axis animation variation (0.1-2.0, default: 0.8) */
  timeScaleX?: number;
  /** Y-axis animation variation (0.1-2.0, default: 1.0) */
  timeScaleY?: number;
}

/** Props for PerlinBackground component */
export interface PerlinBackgroundProps extends BaseNoiseBackgroundProps, FBMBackgroundProps {
  /** X-axis animation variation (0.1-2.0, default: 1.0) */
  timeScaleX?: number;
  /** Y-axis animation variation (0.1-2.0, default: 0.7) */
  timeScaleY?: number;
}

/** Props for WorleyBackground component */
export interface WorleyBackgroundProps extends BaseNoiseBackgroundProps {
  /** Cell size/count scaling (0.5-5.0, default: 2.0) */
  cellScale?: number;
  /** Cell point animation rate (0.0-1.0, default: 0.3) */
  cellAnimSpeed?: number;
  /** Invert distance (cells vs voids, default: true) */
  invert?: boolean;
}

/** Props for VoronoiEdgeBackground component */
export interface VoronoiEdgeBackgroundProps extends BaseNoiseBackgroundProps {
  /** Cell size scaling (0.5-5.0, default: 2.0) */
  cellScale?: number;
  /** Edge line thickness (0.05-0.5, default: 0.15) */
  edgeThickness?: number;
  /** Cell point animation rate (0.0-1.0, default: 0.2) */
  cellAnimSpeed?: number;
}

/** Props for TurbulenceBackground component */
export interface TurbulenceBackgroundProps extends BaseNoiseBackgroundProps, FBMBackgroundProps {
  /** Edge contrast strength (0.5-2.0, default: 1.0) */
  sharpness?: number;
}

/** Props for RidgedBackground component */
export interface RidgedBackgroundProps extends BaseNoiseBackgroundProps, FBMBackgroundProps {
  /** Ridge peak sharpness/power (1.0-4.0, default: 2.0) */
  ridgeSharpness?: number;
  /** Animation speed multiplier (0.1-2.0, default: 0.5) */
  ridgeTimeScale?: number;
}

/** Props for DomainWarpBackground component */
export interface DomainWarpBackgroundProps extends BaseNoiseBackgroundProps {
  /** Coordinate displacement amount (1.0-8.0, default: 4.0) */
  warpStrength?: number;
  /** Warp iteration depth (1-3, default: 2) */
  warpLayers?: number;
}

/** Props for CausticsBackground component */
export interface CausticsBackgroundProps extends BaseNoiseBackgroundProps {
  /** Number of wave directions (1-6, default: 3) */
  waveCount?: number;
  /** Wave pattern density (4.0-16.0, default: 8.0) */
  waveFrequency?: number;
  /** Highlight intensity/power (1.0-3.0, default: 1.5) */
  waveSharpness?: number;
  /** Fine detail blend amount (0.0-0.3, default: 0.15) */
  detailAmount?: number;
}

/** Props for MarbleBackground component */
export interface MarbleBackgroundProps extends BaseNoiseBackgroundProps, FBMBackgroundProps {
  /** Vein density (2.0-16.0, default: 8.0) */
  lineFrequency?: number;
  /** Vein distortion amount (2.0-12.0, default: 6.0) */
  noiseInfluence?: number;
  /** Secondary pattern mix (0.0-1.0, default: 0.3) */
  detailBlend?: number;
}
