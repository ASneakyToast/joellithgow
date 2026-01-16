/**
 * WebGL Background Patterns
 *
 * This module exports all pattern-related components, types, and utilities.
 * Import patterns directly from their Astro components in the noise/ folder
 * until the migration to patterns/ is complete.
 *
 * @example
 * ```astro
 * ---
 * import { SimplexBackground, ConstellationBackground } from '@components/backgrounds/noise';
 * ---
 *
 * <SimplexBackground speed={0.5} intensity={0.6} />
 * <ConstellationBackground starCount={15} />
 * ```
 */

// ============================================================================
// Registry & Pattern Definitions
// ============================================================================
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
  createPatternRecord
} from './registry';

export type {
  PatternCategory,
  ControlGroupId,
  PatternDefaults,
  PatternDefinition,
  PatternType,
  NoiseType
} from './registry';

// ============================================================================
// Types
// ============================================================================
export type {
  WebGLBackgroundColors,
  WebGLBackgroundProps,
  BasePatternBackgroundProps,
  BaseNoiseBackgroundProps,
  FBMBackgroundProps,
  FBMParams,
  // Noise patterns
  SimplexBackgroundProps,
  PerlinBackgroundProps,
  WorleyBackgroundProps,
  VoronoiEdgeBackgroundProps,
  TurbulenceBackgroundProps,
  RidgedBackgroundProps,
  DomainWarpBackgroundProps,
  CausticsBackgroundProps,
  MarbleBackgroundProps,
  // Geometric patterns
  FloatingShapesBackgroundProps,
  ConstellationBackgroundProps,
  MinimalLinesBackgroundProps,
  BlueprintBackgroundProps,
  // Studio types
  BlendMode,
  LayerConfig,
  LayerPatternConfig,
  LayerManagerEventMap
} from './types';

export {
  BLEND_MODES,
  FBM_PATTERNS,
  supportsFBM,
  generateLayerId,
  generateLayerName
} from './types';

// ============================================================================
// Manager Classes
// ============================================================================
export {
  PatternBackgroundManager,
  NoiseBackgroundManager // deprecated alias
} from './PatternBackgroundManager';

export type {
  PatternBackgroundManagerConfig,
  NoiseBackgroundManagerConfig // deprecated alias
} from './PatternBackgroundManager';

// ============================================================================
// Shader Utilities
// ============================================================================
export {
  createBaseUniforms,
  createFBMUniforms,
  baseUniformDeclarations,
  fbmUniformDeclarations
} from './shaders/uniforms';

export type {
  BasePatternConfig,
  BaseNoiseConfig, // deprecated alias
  ColorsConfig
} from './shaders/uniforms';
