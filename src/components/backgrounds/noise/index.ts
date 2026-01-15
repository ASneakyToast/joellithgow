/**
 * Noise Background Components
 *
 * Pattern-specific WebGL background components for organic noise effects.
 * Each component is self-contained with its own shader and configuration.
 *
 * @example
 * ```astro
 * ---
 * import { SimplexBackground, CausticsBackground } from '@components/backgrounds/noise';
 * ---
 *
 * <SimplexBackground speed={0.5} intensity={0.6} />
 * <CausticsBackground waveCount={4} waveFrequency={10} />
 * ```
 */

// Pattern Components
export { default as PerlinBackground } from './PerlinBackground.astro';
export { default as SimplexBackground } from './SimplexBackground.astro';
export { default as WorleyBackground } from './WorleyBackground.astro';
export { default as VoronoiEdgeBackground } from './VoronoiEdgeBackground.astro';
export { default as TurbulenceBackground } from './TurbulenceBackground.astro';
export { default as RidgedBackground } from './RidgedBackground.astro';
export { default as DomainWarpBackground } from './DomainWarpBackground.astro';
export { default as CausticsBackground } from './CausticsBackground.astro';
export { default as MarbleBackground } from './MarbleBackground.astro';

// Types
export type {
  BaseNoiseBackgroundProps,
  FBMBackgroundProps,
  SimplexBackgroundProps,
  PerlinBackgroundProps,
  WorleyBackgroundProps,
  VoronoiEdgeBackgroundProps,
  TurbulenceBackgroundProps,
  RidgedBackgroundProps,
  DomainWarpBackgroundProps,
  CausticsBackgroundProps,
  MarbleBackgroundProps
} from './types';

// Base manager for custom extensions
export { NoiseBackgroundManager } from './NoiseBackgroundManager';
