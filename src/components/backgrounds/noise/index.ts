/**
 * @deprecated Import from '@components/backgrounds/patterns' instead
 *
 * This module re-exports everything from the patterns folder for backward compatibility.
 * All pattern components and utilities have been moved to the patterns/ folder.
 *
 * @example
 * // Old (deprecated):
 * import { SimplexBackground } from '@components/backgrounds/noise';
 *
 * // New (preferred):
 * import { SimplexBackground } from '@components/backgrounds/patterns';
 */

// Re-export everything from patterns
export * from '../patterns';

// Re-export pattern components
export { default as SimplexBackground } from '../patterns/SimplexBackground.astro';
export { default as PerlinBackground } from '../patterns/PerlinBackground.astro';
export { default as WorleyBackground } from '../patterns/WorleyBackground.astro';
export { default as VoronoiEdgeBackground } from '../patterns/VoronoiEdgeBackground.astro';
export { default as TurbulenceBackground } from '../patterns/TurbulenceBackground.astro';
export { default as RidgedBackground } from '../patterns/RidgedBackground.astro';
export { default as DomainWarpBackground } from '../patterns/DomainWarpBackground.astro';
export { default as CausticsBackground } from '../patterns/CausticsBackground.astro';
export { default as MarbleBackground } from '../patterns/MarbleBackground.astro';
export { default as FloatingShapesBackground } from '../patterns/FloatingShapesBackground.astro';
export { default as ConstellationBackground } from '../patterns/ConstellationBackground.astro';
export { default as MinimalLinesBackground } from '../patterns/MinimalLinesBackground.astro';
export { default as BlueprintBackground } from '../patterns/BlueprintBackground.astro';

// Emit deprecation warning in development
if (import.meta.env?.DEV) {
  console.warn(
    '[backgrounds/noise] This module is deprecated. ' +
    'Import from "@components/backgrounds/patterns" instead.'
  );
}
