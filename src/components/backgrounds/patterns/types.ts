/**
 * WebGL Background Pattern Types
 *
 * Consolidated type definitions for all WebGL background patterns.
 * This is the single source of truth for pattern-related types.
 */

// Import for internal use (needed by generateLayerName)
import { getPatternByInternalId as _getPatternByInternalId } from './registry';

// Re-export registry types
export type {
  PatternCategory,
  ControlGroupId,
  PatternDefaults,
  PatternDefinition,
  PatternType,
  NoiseType,
  UniformField
} from './registry';

export {
  PATTERNS,
  PATTERN_NAMES,
  PATTERN_DEFAULTS,
  PATTERN_LIST,
  getPatternById,
  getPatternByInternalId,
  getPatternsByCategory,
  getAllPatternIds,
  getAllInternalIds,
  patternHasControlGroup,
  createPatternRecord,
  uniformNameFromKey,
  dataAttrFromKey
} from './registry';

// ============================================================================
// Common WebGL Types
// ============================================================================

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

// ============================================================================
// Base Pattern Props
// ============================================================================

/** Base props shared by all pattern components */
export interface BasePatternBackgroundProps extends WebGLBackgroundProps {
  /** Noise scale / detail level (default: 2.0) */
  noiseScale?: number;
  /** Whether to animate the noise (default: true) */
  animated?: boolean;
  /** Animation direction in degrees (0-360, default: 315 for down-left) */
  animationAngle?: number;
}

/** @deprecated Use BasePatternBackgroundProps instead */
export type BaseNoiseBackgroundProps = BasePatternBackgroundProps;

// ============================================================================
// FBM Parameters
// ============================================================================

/** FBM (Fractal Brownian Motion) parameters - shared across FBM patterns */
export interface FBMBackgroundProps {
  /** Number of noise octaves (1-8, default: 4) */
  octaves?: number;
  /** Frequency multiplier per octave (1.5-3.5, default: 2.0) */
  lacunarity?: number;
  /** Amplitude multiplier per octave (0.3-0.7, default: 0.5) */
  gain?: number;
}

/** @deprecated Use FBMBackgroundProps instead */
export type FBMParams = FBMBackgroundProps;

// ============================================================================
// Noise Pattern Props
// ============================================================================

/** Props for SimplexBackground component */
export interface SimplexBackgroundProps extends BasePatternBackgroundProps, FBMBackgroundProps {
  /** X-axis animation variation (0.1-2.0, default: 0.8) */
  timeScaleX?: number;
  /** Y-axis animation variation (0.1-2.0, default: 1.0) */
  timeScaleY?: number;
}

/** Props for PerlinBackground component */
export interface PerlinBackgroundProps extends BasePatternBackgroundProps, FBMBackgroundProps {
  /** X-axis animation variation (0.1-2.0, default: 1.0) */
  timeScaleX?: number;
  /** Y-axis animation variation (0.1-2.0, default: 0.7) */
  timeScaleY?: number;
}

/** Props for WorleyBackground component */
export interface WorleyBackgroundProps extends BasePatternBackgroundProps {
  /** Cell size/count scaling (0.5-5.0, default: 2.0) */
  cellScale?: number;
  /** Cell point animation rate (0.0-1.0, default: 0.3) */
  cellAnimSpeed?: number;
  /** Invert distance (cells vs voids, default: true) */
  invert?: boolean;
}

/** Props for VoronoiEdgeBackground component */
export interface VoronoiEdgeBackgroundProps extends BasePatternBackgroundProps {
  /** Cell size scaling (0.5-5.0, default: 2.0) */
  cellScale?: number;
  /** Edge line thickness (0.05-0.5, default: 0.15) */
  edgeThickness?: number;
  /** Cell point animation rate (0.0-1.0, default: 0.2) */
  cellAnimSpeed?: number;
}

/** Props for TurbulenceBackground component */
export interface TurbulenceBackgroundProps extends BasePatternBackgroundProps, FBMBackgroundProps {
  /** Edge contrast strength (0.5-2.0, default: 1.0) */
  sharpness?: number;
}

/** Props for RidgedBackground component */
export interface RidgedBackgroundProps extends BasePatternBackgroundProps, FBMBackgroundProps {
  /** Ridge peak sharpness/power (1.0-4.0, default: 2.0) */
  ridgeSharpness?: number;
  /** Animation speed multiplier (0.1-2.0, default: 0.5) */
  ridgeTimeScale?: number;
}

/** Props for DomainWarpBackground component */
export interface DomainWarpBackgroundProps extends BasePatternBackgroundProps {
  /** Coordinate displacement amount (1.0-8.0, default: 4.0) */
  warpStrength?: number;
  /** Warp iteration depth (1-3, default: 2) */
  warpLayers?: number;
}

/** Props for CausticsBackground component */
export interface CausticsBackgroundProps extends BasePatternBackgroundProps {
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
export interface MarbleBackgroundProps extends BasePatternBackgroundProps, FBMBackgroundProps {
  /** Vein density (2.0-16.0, default: 8.0) */
  lineFrequency?: number;
  /** Vein distortion amount (2.0-12.0, default: 6.0) */
  noiseInfluence?: number;
  /** Secondary pattern mix (0.0-1.0, default: 0.3) */
  detailBlend?: number;
}

// ============================================================================
// Geometric Pattern Props
// ============================================================================

/** Props for FloatingShapesBackground component */
export interface FloatingShapesBackgroundProps extends BasePatternBackgroundProps {
  /** Number of shapes per unit area (0.5-5.0, default: 1.5) */
  shapeDensity?: number;
  /** Shape size range (0.02-0.15, default: 0.05) */
  shapeSize?: number;
  /** Size variation between shapes (0.0-1.0, default: 0.5) */
  sizeVariation?: number;
  /** Mix of shape types: 0=circles only, 0.5=mixed, 1=polygons only (default: 0.5) */
  shapeMix?: number;
  /** Shape edge softness (0.001-0.02, default: 0.005) */
  edgeSoftness?: number;
  /** Individual shape rotation speed (0.0-1.0, default: 0.2) */
  rotationSpeed?: number;
}

/** Props for ConstellationBackground component */
export interface ConstellationBackgroundProps extends BasePatternBackgroundProps {
  /** Number of star points (3-30, default: 12) */
  starCount?: number;
  /** Point size (0.002-0.02, default: 0.006) */
  pointSize?: number;
  /** Connection distance threshold (0.05-0.4, default: 0.15) */
  connectionDistance?: number;
  /** Line thickness (0.0005-0.005, default: 0.001) */
  lineThickness?: number;
  /** Line opacity falloff (0.5-3.0, default: 1.5) */
  lineFalloff?: number;
  /** Star twinkle intensity (0.0-1.0, default: 0.3) */
  twinkleIntensity?: number;
  /** Movement speed of stars (0.0-1.0, default: 0.1) */
  driftSpeed?: number;
}

/** Props for MinimalLinesBackground component */
export interface MinimalLinesBackgroundProps extends BasePatternBackgroundProps {
  /** Line density - grid cells per unit (2-30, default: 8) */
  lineDensity?: number;
  /** Line length range (0.02-0.3, default: 0.15) */
  lineLength?: number;
  /** Length variation (0.0-1.0, default: 0.6) */
  lengthVariation?: number;
  /** Line thickness (0.001-0.01, default: 0.003) */
  lineThickness?: number;
  /** Angle variation in degrees (0-90, default: 45) */
  angleVariation?: number;
  /** Base angle for lines in degrees (0-180, default: 45) */
  baseAngle?: number;
  /** Probability of crosshatch intersections (0.0-1.0, default: 0.2) */
  crosshatchChance?: number;
  /** Ratio of cells that show lines (0.1-1.0, default: 0.5 = 50%) */
  fillRatio?: number;
}

/** Props for BlueprintBackground component */
export interface BlueprintBackgroundProps extends BasePatternBackgroundProps {
  /** Density of blueprint elements (0.5-3.0, default: 1.0) */
  elementDensity?: number;
  /** Dimension line length (0.05-0.3, default: 0.12) */
  dimensionLength?: number;
  /** Line thickness (0.0005-0.003, default: 0.001) */
  lineThickness?: number;
  /** End marker size (0.003-0.015, default: 0.006) */
  markerSize?: number;
  /** Corner bracket size (0.02-0.1, default: 0.04) */
  bracketSize?: number;
  /** Probability of corner brackets vs dimension lines (0.0-1.0, default: 0.3) */
  bracketRatio?: number;
  /** Tick mark density along dimension lines (0-5, default: 2) */
  tickDensity?: number;
}

/** Props for GeometricGridPatternBackground component */
export interface GeometricGridPatternBackgroundProps extends BasePatternBackgroundProps {
  /** Grid cell size in pixels (20-200, default: 80) */
  gridSize?: number;
  /** Grid line width in pixels (0.5-5, default: 1) */
  lineWidth?: number;
  /** Animation type: 0=drift, 1=pulse, 2=wave (default: 0) */
  animationType?: number;
}

// ============================================================================
// Studio/Layer Types
// ============================================================================

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
  patternType: string;
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

  // All pattern-specific parameters (optional)
  [key: string]: unknown;
}

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
export function generateLayerName(patternType: string, existingNames: string[]): string {
  const pattern = _getPatternByInternalId(patternType);
  const baseName = pattern?.name || patternType;
  let count = 1;
  let name = baseName;

  while (existingNames.includes(name)) {
    count++;
    name = `${baseName} ${count}`;
  }

  return name;
}

// ============================================================================
// Backward Compatibility
// ============================================================================

/** @deprecated Use PatternType from registry instead */
export type { PatternType as NoiseType } from './registry';

/** Patterns that use Fractal Brownian Motion (FBM) */
export const FBM_PATTERNS = ['perlin', 'simplex', 'turbulence', 'ridged', 'marble'];

/** Check if a pattern supports FBM parameters */
export function supportsFBM(patternType: string): boolean {
  return FBM_PATTERNS.includes(patternType);
}
