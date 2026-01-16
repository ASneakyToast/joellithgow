/**
 * Pattern Registry - Single source of truth for all WebGL background patterns
 *
 * This registry defines all available patterns with their metadata, defaults,
 * and control groups. Adding a new pattern only requires:
 * 1. Creating the fragment shader
 * 2. Adding an entry here
 * 3. (Optional) Creating a control group component
 */

import type { WebGLBackgroundColors } from '../types';

// ============================================================================
// Types
// ============================================================================

/** Pattern categories for organization and filtering */
export type PatternCategory = 'noise' | 'geometric' | 'particles' | 'waves' | 'gradients';

/** Renderer engine types */
export type RendererEngine = 'webgl' | 'p5js';

/**
 * Control group identifiers - determines which UI controls to show in PropertiesPanel
 * Each pattern can specify multiple control groups
 */
export type ControlGroupId =
  // Shared control groups
  | 'fbm'           // octaves, lacunarity, gain
  // Noise pattern control groups
  | 'perlinSimplex' // timeScaleX, timeScaleY
  | 'worley'        // cellScale, cellAnimSpeed, invert
  | 'voronoiEdge'   // cellScale, edgeThickness, cellAnimSpeed
  | 'turbulence'    // sharpness
  | 'ridged'        // ridgeSharpness, ridgeTimeScale
  | 'domainWarp'    // warpStrength, warpLayers
  | 'caustics'      // waveCount, waveFrequency, waveSharpness, detailAmount
  | 'marble'        // lineFrequency, noiseInfluence, detailBlend
  // Geometric pattern control groups
  | 'floatingShapes' // shapeDensity, shapeSize, sizeVariation, shapeMix, edgeSoftness, rotationSpeed
  | 'constellation'  // starCount, pointSize, connectionDistance, lineThickness, lineFalloff, twinkleIntensity, driftSpeed
  | 'minimalLines'   // lineDensity, lineLength, lengthVariation, lineThickness, angleVariation, baseAngle, crosshatchChance
  | 'blueprint';     // elementDensity, dimensionLength, lineThickness, markerSize, bracketSize, bracketRatio, tickDensity

/** Base configuration shared by all patterns */
export interface PatternDefaults {
  // General parameters
  speed: number;
  intensity: number;
  noiseScale: number;
  animated: boolean;
  animationAngle: number;
  colors: Required<WebGLBackgroundColors>;
  // Layer compositing (studio mode)
  opacity: number;
  blendMode: string;
  // Pattern-specific parameters are added dynamically
  [key: string]: unknown;
}

/** Complete pattern definition */
export interface PatternDefinition {
  /** URL-safe slug (used in routes): 'floating-shapes' */
  id: string;
  /** Internal identifier (camelCase, used in code): 'floatingShapes' */
  internalId: string;
  /** Display name: 'Floating Shapes' */
  name: string;
  /** Description for UI */
  description: string;
  /** Pattern category for organization */
  category: PatternCategory;
  /** Whether pattern uses FBM */
  supportsFBM: boolean;
  /** Control groups to show in PropertiesPanel */
  controlGroups: ControlGroupId[];
  /** Default configuration values */
  defaults: PatternDefaults;
  /** Show "New" badge in UI */
  isNew?: boolean;
  /** Rendering engine for the pattern */
  rendererEngine: RendererEngine;
}

// ============================================================================
// Default Colors
// ============================================================================

const DEFAULT_COLORS: Required<WebGLBackgroundColors> = {
  primary: '#FF6B6B',
  secondary: '#4ECDC4',
  tertiary: '#FFE66D'
};

// ============================================================================
// Pattern Definitions
// ============================================================================

export const PATTERNS: PatternDefinition[] = [
  // -------------------------------------------------------------------------
  // NOISE PATTERNS
  // -------------------------------------------------------------------------
  {
    id: 'perlin',
    internalId: 'perlin',
    name: 'Perlin Noise',
    description: 'Classic gradient noise with smooth, organic variations',
    category: 'noise',
    supportsFBM: true,
    controlGroups: ['fbm', 'perlinSimplex'],
    rendererEngine: 'webgl',
    defaults: {
      speed: 0.5,
      intensity: 0.6,
      noiseScale: 2.0,
      animated: true,
      animationAngle: 315,
      colors: { ...DEFAULT_COLORS },
      opacity: 1,
      blendMode: 'normal',
      // FBM
      octaves: 4,
      lacunarity: 2.0,
      gain: 0.5,
      // Perlin-specific
      timeScaleX: 1.0,
      timeScaleY: 0.7
    }
  },
  {
    id: 'simplex',
    internalId: 'simplex',
    name: 'Simplex Noise',
    description: 'Smooth flowing organic patterns with less directional artifacts',
    category: 'noise',
    supportsFBM: true,
    controlGroups: ['fbm', 'perlinSimplex'],
    rendererEngine: 'webgl',
    defaults: {
      speed: 0.4,
      intensity: 0.5,
      noiseScale: 3.0,
      animated: true,
      animationAngle: 315,
      colors: { ...DEFAULT_COLORS },
      opacity: 1,
      blendMode: 'normal',
      // FBM
      octaves: 5,
      lacunarity: 2.0,
      gain: 0.5,
      // Simplex-specific
      timeScaleX: 0.8,
      timeScaleY: 1.0
    }
  },
  {
    id: 'worley',
    internalId: 'worley',
    name: 'Worley Noise',
    description: 'Cellular patterns based on distance to random points',
    category: 'noise',
    supportsFBM: false,
    controlGroups: ['worley'],
    rendererEngine: 'webgl',
    defaults: {
      speed: 0.3,
      intensity: 0.5,
      noiseScale: 1.5,
      animated: true,
      animationAngle: 315,
      colors: { ...DEFAULT_COLORS },
      opacity: 1,
      blendMode: 'normal',
      // Worley-specific
      cellScale: 2.0,
      cellAnimSpeed: 0.3,
      invert: true
    }
  },
  {
    id: 'voronoi-edge',
    internalId: 'voronoiEdge',
    name: 'Voronoi Edge',
    description: 'Cell boundaries creating crack or tile-like patterns',
    category: 'noise',
    supportsFBM: false,
    controlGroups: ['voronoiEdge'],
    rendererEngine: 'webgl',
    defaults: {
      speed: 0.4,
      intensity: 0.6,
      noiseScale: 2.0,
      animated: true,
      animationAngle: 315,
      colors: { ...DEFAULT_COLORS },
      opacity: 1,
      blendMode: 'normal',
      // Voronoi-specific
      cellScale: 2.0,
      edgeThickness: 0.15,
      cellAnimSpeed: 0.2
    }
  },
  {
    id: 'turbulence',
    internalId: 'turbulence',
    name: 'Turbulence',
    description: 'Billowy cloud-like patterns with high contrast swirls',
    category: 'noise',
    supportsFBM: true,
    controlGroups: ['fbm', 'turbulence'],
    rendererEngine: 'webgl',
    defaults: {
      speed: 0.5,
      intensity: 0.55,
      noiseScale: 2.5,
      animated: true,
      animationAngle: 315,
      colors: { ...DEFAULT_COLORS },
      opacity: 1,
      blendMode: 'normal',
      // FBM
      octaves: 5,
      lacunarity: 2.0,
      gain: 0.5,
      // Turbulence-specific
      sharpness: 1.0
    }
  },
  {
    id: 'ridged',
    internalId: 'ridged',
    name: 'Ridged Multifractal',
    description: 'Sharp ridge patterns like mountain ranges or lightning',
    category: 'noise',
    supportsFBM: true,
    controlGroups: ['fbm', 'ridged'],
    rendererEngine: 'webgl',
    defaults: {
      speed: 0.4,
      intensity: 0.6,
      noiseScale: 2.0,
      animated: true,
      animationAngle: 315,
      colors: { ...DEFAULT_COLORS },
      opacity: 1,
      blendMode: 'normal',
      // FBM
      octaves: 5,
      lacunarity: 2.0,
      gain: 0.5,
      // Ridged-specific
      ridgeSharpness: 2.0,
      ridgeTimeScale: 0.5
    }
  },
  {
    id: 'domain-warp',
    internalId: 'domainWarp',
    name: 'Domain Warp',
    description: 'Fluid distortion effect by warping coordinate space',
    category: 'noise',
    supportsFBM: false,
    controlGroups: ['domainWarp'],
    rendererEngine: 'webgl',
    defaults: {
      speed: 0.3,
      intensity: 0.5,
      noiseScale: 1.5,
      animated: true,
      animationAngle: 315,
      colors: { ...DEFAULT_COLORS },
      opacity: 1,
      blendMode: 'normal',
      // Domain Warp-specific
      warpStrength: 4.0,
      warpLayers: 2
    }
  },
  {
    id: 'caustics',
    internalId: 'caustics',
    name: 'Caustics',
    description: 'Underwater light refraction patterns',
    category: 'noise',
    supportsFBM: false,
    controlGroups: ['caustics'],
    rendererEngine: 'webgl',
    defaults: {
      speed: 0.6,
      intensity: 0.55,
      noiseScale: 1.8,
      animated: true,
      animationAngle: 315,
      colors: { ...DEFAULT_COLORS },
      opacity: 1,
      blendMode: 'normal',
      // Caustics-specific
      waveCount: 3,
      waveFrequency: 8.0,
      waveSharpness: 1.5,
      detailAmount: 0.15
    }
  },
  {
    id: 'marble',
    internalId: 'marble',
    name: 'Marble',
    description: 'Flowing veins like natural stone or wood grain',
    category: 'noise',
    supportsFBM: true,
    controlGroups: ['fbm', 'marble'],
    rendererEngine: 'webgl',
    defaults: {
      speed: 0.3,
      intensity: 0.5,
      noiseScale: 2.0,
      animated: true,
      animationAngle: 315,
      colors: { ...DEFAULT_COLORS },
      opacity: 1,
      blendMode: 'normal',
      // FBM
      octaves: 4,
      lacunarity: 2.0,
      gain: 0.5,
      // Marble-specific
      lineFrequency: 8.0,
      noiseInfluence: 6.0,
      detailBlend: 0.3
    }
  },

  // -------------------------------------------------------------------------
  // GEOMETRIC PATTERNS
  // -------------------------------------------------------------------------
  {
    id: 'floating-shapes',
    internalId: 'floatingShapes',
    name: 'Floating Shapes',
    description: 'Drifting geometric shapes - triangles, hexagons, circles',
    category: 'geometric',
    supportsFBM: false,
    controlGroups: ['floatingShapes'],
    isNew: true,
    rendererEngine: 'p5js',
    defaults: {
      speed: 0.3,
      intensity: 0.5,
      noiseScale: 1.0,
      animated: true,
      animationAngle: 315,
      colors: { ...DEFAULT_COLORS },
      opacity: 1,
      blendMode: 'normal',
      // FloatingShapes-specific
      shapeDensity: 1.5,
      shapeSize: 0.05,
      sizeVariation: 0.5,
      shapeMix: 0.5,
      edgeSoftness: 0.005,
      rotationSpeed: 0.2
    }
  },
  {
    id: 'constellation',
    internalId: 'constellation',
    name: 'Constellation',
    description: 'Star map with connected nodes like a constellation',
    category: 'geometric',
    supportsFBM: false,
    controlGroups: ['constellation'],
    isNew: true,
    rendererEngine: 'p5js',
    defaults: {
      speed: 0.3,
      intensity: 0.6,
      noiseScale: 1.0,
      animated: true,
      animationAngle: 315,
      colors: { ...DEFAULT_COLORS },
      opacity: 1,
      blendMode: 'normal',
      // Constellation-specific
      starCount: 12,
      pointSize: 0.006,
      connectionDistance: 0.15,
      lineThickness: 0.001,
      lineFalloff: 1.5,
      twinkleIntensity: 0.3,
      driftSpeed: 0.1
    }
  },
  {
    id: 'minimal-lines',
    internalId: 'minimalLines',
    name: 'Minimal Lines',
    description: 'Sparse diagonal lines and crosshatch fragments',
    category: 'geometric',
    supportsFBM: false,
    controlGroups: ['minimalLines'],
    isNew: true,
    rendererEngine: 'p5js',
    defaults: {
      speed: 0.3,
      intensity: 0.5,
      noiseScale: 1.0,
      animated: true,
      animationAngle: 315,
      colors: { ...DEFAULT_COLORS },
      opacity: 1,
      blendMode: 'normal',
      // MinimalLines-specific
      lineDensity: 8.0,
      lineLength: 0.15,
      lengthVariation: 0.6,
      lineThickness: 0.003,
      angleVariation: 45,
      baseAngle: 45,
      crosshatchChance: 0.2,
      fillRatio: 0.5
    }
  },
  {
    id: 'blueprint',
    internalId: 'blueprint',
    name: 'Blueprint',
    description: 'Technical drawing style with dimension lines and brackets',
    category: 'geometric',
    supportsFBM: false,
    controlGroups: ['blueprint'],
    isNew: true,
    rendererEngine: 'p5js',
    defaults: {
      speed: 0.2,
      intensity: 0.5,
      noiseScale: 1.0,
      animated: true,
      animationAngle: 315,
      colors: { ...DEFAULT_COLORS },
      opacity: 1,
      blendMode: 'normal',
      // Blueprint-specific
      elementDensity: 1.0,
      dimensionLength: 0.12,
      lineThickness: 0.001,
      markerSize: 0.006,
      bracketSize: 0.04,
      bracketRatio: 0.3,
      tickDensity: 2
    }
  }
];

// ============================================================================
// Lookup Functions
// ============================================================================

/** Get pattern by URL slug (id) */
export function getPatternById(id: string): PatternDefinition | undefined {
  return PATTERNS.find(p => p.id === id);
}

/** Get pattern by internal identifier */
export function getPatternByInternalId(internalId: string): PatternDefinition | undefined {
  return PATTERNS.find(p => p.internalId === internalId);
}

/** Get all patterns in a category */
export function getPatternsByCategory(category: PatternCategory): PatternDefinition[] {
  return PATTERNS.filter(p => p.category === category);
}

/** Get all URL slugs (for getStaticPaths) */
export function getAllPatternIds(): string[] {
  return PATTERNS.map(p => p.id);
}

/** Get all internal identifiers */
export function getAllInternalIds(): string[] {
  return PATTERNS.map(p => p.internalId);
}

/** Get patterns that support FBM */
export function getFBMPatterns(): PatternDefinition[] {
  return PATTERNS.filter(p => p.supportsFBM);
}

/** Check if a pattern supports a specific control group */
export function patternHasControlGroup(patternId: string, controlGroup: ControlGroupId): boolean {
  const pattern = getPatternById(patternId) || getPatternByInternalId(patternId);
  return pattern?.controlGroups.includes(controlGroup) ?? false;
}

// ============================================================================
// Type Guards & Utilities
// ============================================================================

/** All valid pattern internal IDs as a type */
export type PatternType = typeof PATTERNS[number]['internalId'];

/** Alias for backward compatibility */
export type NoiseType = PatternType;

/** Create a record keyed by internal ID */
export function createPatternRecord<T>(
  getValue: (pattern: PatternDefinition) => T
): Record<string, T> {
  const record: Record<string, T> = {};
  for (const pattern of PATTERNS) {
    record[pattern.internalId] = getValue(pattern);
  }
  return record;
}

/** Get pattern names as a record (for backward compat with PATTERN_NAMES) */
export const PATTERN_NAMES = createPatternRecord(p => p.name);

/** Get pattern defaults as a record (for backward compat with PATTERN_DEFAULTS) */
export const PATTERN_DEFAULTS = createPatternRecord(p => p.defaults);

/** Get pattern list (for backward compat with PATTERN_LIST) */
export const PATTERN_LIST = getAllInternalIds();

/** Get patterns by renderer engine */
export function getPatternsByEngine(engine: RendererEngine): PatternDefinition[] {
  return PATTERNS.filter(p => p.rendererEngine === engine);
}

/** Check if pattern uses p5.js */
export function isP5Pattern(patternId: string): boolean {
  const pattern = getPatternById(patternId) || getPatternByInternalId(patternId);
  return pattern?.rendererEngine === 'p5js';
}
