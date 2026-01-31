/**
 * Manager Factory for Background Studio
 * Creates pattern managers using the registry for fully data-driven instantiation.
 * Supports both WebGL (Three.js via GenericWebGLManager) and p5.js renderers.
 */

import { PatternBackgroundManager } from '../patterns/PatternBackgroundManager';
import { P5PatternManager } from '../patterns/p5/P5PatternManager';
import { GenericWebGLManager } from '../patterns/GenericWebGLManager';
import {
  getPatternByInternalId,
  isP5Pattern,
  PATTERN_DEFAULTS,
  dataAttrFromKey,
  type PatternDefinition
} from '../patterns/registry';
import type { PatternType, LayerPatternConfig } from '../patterns/types';

// Backward compat alias
type NoiseType = PatternType;

/**
 * Union type for all pattern managers
 */
export type AnyPatternManager =
  | PatternBackgroundManager<any>
  | P5PatternManager<any>;

/** Shader cache to avoid re-importing the same shader */
const shaderCache = new Map<string, string>();

/**
 * Convert LayerPatternConfig to data attributes for container element.
 * Uses the registry's uniformFields for pattern-specific attributes.
 */
function configToDataAttributes(config: LayerPatternConfig, patternDef?: PatternDefinition): Record<string, string> {
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

  // Use uniformFields from registry if available, otherwise skip pattern-specific attrs
  if (patternDef) {
    for (const field of patternDef.uniformFields) {
      if (config[field.key] !== undefined) {
        attrs[`data-${dataAttrFromKey(field.key)}`] = String(config[field.key]);
      }
    }
  }

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
  const patternDef = getPatternByInternalId(patternType);
  const container = document.createElement('div');
  container.className = `${isP5 ? 'p5' : 'webgl'}-background-container ${isP5 ? '' : 'noise-texture '}layer-canvas layer-${patternType}`;
  container.id = `layer-${layerId}`;
  container.setAttribute('aria-hidden', 'true');
  container.style.zIndex = String(zIndex);

  // Set effect type for auto-init
  container.dataset.effectType = patternType;

  // Set data attributes from config
  const attrs = configToDataAttributes(config, patternDef);
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
 * Create a pattern manager for a layer (async - loads shader/manager dynamically)
 * Automatically selects WebGL or p5.js manager based on pattern type
 */
export async function createPatternManager(
  container: HTMLElement,
  patternType: NoiseType
): Promise<AnyPatternManager> {
  const patternDef = getPatternByInternalId(patternType);
  if (!patternDef) {
    throw new Error(`Unknown pattern type: ${patternType}`);
  }

  // p5.js patterns
  if (patternDef.rendererEngine === 'p5js' && patternDef.managerImport) {
    const ManagerClass = await patternDef.managerImport();
    return new ManagerClass(container);
  }

  // WebGL patterns
  if (patternDef.shaderImport) {
    let shader = shaderCache.get(patternType);
    if (!shader) {
      shader = await patternDef.shaderImport();
      shaderCache.set(patternType, shader);
    }
    return new GenericWebGLManager(container, patternDef, shader);
  }

  throw new Error(`Pattern ${patternType} has no shaderImport or managerImport`);
}

/**
 * Get default configuration for a pattern type
 */
export function getPatternDefaults(patternType: NoiseType): LayerPatternConfig {
  return { ...PATTERN_DEFAULTS[patternType] };
}

/**
 * Export types for consumers
 */
export { PatternBackgroundManager };
