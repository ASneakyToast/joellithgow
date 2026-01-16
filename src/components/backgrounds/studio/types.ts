/**
 * Background Studio Types
 * Re-exports from patterns/types.ts for backward compatibility
 */

// Re-export types from the consolidated patterns types
export type {
  BlendMode,
  LayerConfig,
  LayerPatternConfig,
  LayerManagerEventMap,
  PatternType,
  NoiseType,
  WebGLBackgroundColors
} from '../patterns/types';

export {
  BLEND_MODES,
  PATTERN_DEFAULTS,
  PATTERN_NAMES,
  PATTERN_LIST,
  generateLayerId,
  generateLayerName
} from '../patterns/types';
