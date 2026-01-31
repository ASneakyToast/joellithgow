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
  | 'blueprint'       // elementDensity, dimensionLength, lineThickness, markerSize, bracketSize, bracketRatio, tickDensity
  | 'geometricGrid';  // gridSize, lineWidth, animationType

/**
 * Describes a pattern-specific uniform field for data-driven manager creation.
 * The uniform name is derived automatically: key 'timeScaleX' -> uniform 'uTimeScaleX'.
 * Data attribute parsing uses container.dataset[key] (camelCase auto-conversion).
 */
export interface UniformField {
  /** Config key (camelCase), also used for dataset access: 'timeScaleX' */
  key: string;
  /** Parse/uniform type */
  type: 'float' | 'int' | 'bool';
}

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
  /** Pattern-specific uniform fields for data-driven manager creation */
  uniformFields: UniformField[];
  /** Lazy import for fragment shader (WebGL patterns) */
  shaderImport?: () => Promise<string>;
  /** Lazy import for p5 manager class (p5js patterns) */
  managerImport?: () => Promise<any>;
}

// ============================================================================
// Helpers
// ============================================================================

/** Derive GLSL uniform name from config key: 'timeScaleX' -> 'uTimeScaleX' */
export function uniformNameFromKey(key: string): string {
  return 'u' + key.charAt(0).toUpperCase() + key.slice(1);
}

/** Derive kebab-case data attribute from camelCase key: 'timeScaleX' -> 'time-scale-x' */
export function dataAttrFromKey(key: string): string {
  return key.replace(/[A-Z]/g, m => '-' + m.toLowerCase());
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
    uniformFields: [
      { key: 'octaves', type: 'int' },
      { key: 'lacunarity', type: 'float' },
      { key: 'gain', type: 'float' },
      { key: 'timeScaleX', type: 'float' },
      { key: 'timeScaleY', type: 'float' },
    ],
    shaderImport: () => import('./shaders/fragments/noise/perlin.glsl').then(m => m.perlinFragmentShader),
    defaults: {
      speed: 0.5,
      intensity: 0.6,
      noiseScale: 2.0,
      animated: true,
      animationAngle: 315,
      colors: { ...DEFAULT_COLORS },
      opacity: 1,
      blendMode: 'normal',
      octaves: 4,
      lacunarity: 2.0,
      gain: 0.5,
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
    uniformFields: [
      { key: 'octaves', type: 'int' },
      { key: 'lacunarity', type: 'float' },
      { key: 'gain', type: 'float' },
      { key: 'timeScaleX', type: 'float' },
      { key: 'timeScaleY', type: 'float' },
    ],
    shaderImport: () => import('./shaders/fragments/noise/simplex.glsl').then(m => m.simplexFragmentShader),
    defaults: {
      speed: 0.4,
      intensity: 0.5,
      noiseScale: 3.0,
      animated: true,
      animationAngle: 315,
      colors: { ...DEFAULT_COLORS },
      opacity: 1,
      blendMode: 'normal',
      octaves: 5,
      lacunarity: 2.0,
      gain: 0.5,
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
    uniformFields: [
      { key: 'cellScale', type: 'float' },
      { key: 'cellAnimSpeed', type: 'float' },
      { key: 'invert', type: 'bool' },
    ],
    shaderImport: () => import('./shaders/fragments/noise/worley.glsl').then(m => m.worleyFragmentShader),
    defaults: {
      speed: 0.3,
      intensity: 0.5,
      noiseScale: 1.5,
      animated: true,
      animationAngle: 315,
      colors: { ...DEFAULT_COLORS },
      opacity: 1,
      blendMode: 'normal',
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
    uniformFields: [
      { key: 'cellScale', type: 'float' },
      { key: 'edgeThickness', type: 'float' },
      { key: 'cellAnimSpeed', type: 'float' },
    ],
    shaderImport: () => import('./shaders/fragments/noise/voronoi-edge.glsl').then(m => m.voronoiEdgeFragmentShader),
    defaults: {
      speed: 0.4,
      intensity: 0.6,
      noiseScale: 2.0,
      animated: true,
      animationAngle: 315,
      colors: { ...DEFAULT_COLORS },
      opacity: 1,
      blendMode: 'normal',
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
    uniformFields: [
      { key: 'octaves', type: 'int' },
      { key: 'lacunarity', type: 'float' },
      { key: 'gain', type: 'float' },
      { key: 'sharpness', type: 'float' },
    ],
    shaderImport: () => import('./shaders/fragments/noise/turbulence.glsl').then(m => m.turbulenceFragmentShader),
    defaults: {
      speed: 0.5,
      intensity: 0.55,
      noiseScale: 2.5,
      animated: true,
      animationAngle: 315,
      colors: { ...DEFAULT_COLORS },
      opacity: 1,
      blendMode: 'normal',
      octaves: 5,
      lacunarity: 2.0,
      gain: 0.5,
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
    uniformFields: [
      { key: 'octaves', type: 'int' },
      { key: 'lacunarity', type: 'float' },
      { key: 'gain', type: 'float' },
      { key: 'ridgeSharpness', type: 'float' },
      { key: 'ridgeTimeScale', type: 'float' },
    ],
    shaderImport: () => import('./shaders/fragments/noise/ridged.glsl').then(m => m.ridgedFragmentShader),
    defaults: {
      speed: 0.4,
      intensity: 0.6,
      noiseScale: 2.0,
      animated: true,
      animationAngle: 315,
      colors: { ...DEFAULT_COLORS },
      opacity: 1,
      blendMode: 'normal',
      octaves: 5,
      lacunarity: 2.0,
      gain: 0.5,
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
    uniformFields: [
      { key: 'warpStrength', type: 'float' },
      { key: 'warpLayers', type: 'int' },
    ],
    shaderImport: () => import('./shaders/fragments/noise/domain-warp.glsl').then(m => m.domainWarpFragmentShader),
    defaults: {
      speed: 0.3,
      intensity: 0.5,
      noiseScale: 1.5,
      animated: true,
      animationAngle: 315,
      colors: { ...DEFAULT_COLORS },
      opacity: 1,
      blendMode: 'normal',
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
    uniformFields: [
      { key: 'waveCount', type: 'int' },
      { key: 'waveFrequency', type: 'float' },
      { key: 'waveSharpness', type: 'float' },
      { key: 'detailAmount', type: 'float' },
    ],
    shaderImport: () => import('./shaders/fragments/noise/caustics.glsl').then(m => m.causticsFragmentShader),
    defaults: {
      speed: 0.6,
      intensity: 0.55,
      noiseScale: 1.8,
      animated: true,
      animationAngle: 315,
      colors: { ...DEFAULT_COLORS },
      opacity: 1,
      blendMode: 'normal',
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
    uniformFields: [
      { key: 'octaves', type: 'int' },
      { key: 'lacunarity', type: 'float' },
      { key: 'gain', type: 'float' },
      { key: 'lineFrequency', type: 'float' },
      { key: 'noiseInfluence', type: 'float' },
      { key: 'detailBlend', type: 'float' },
    ],
    shaderImport: () => import('./shaders/fragments/noise/marble.glsl').then(m => m.marbleFragmentShader),
    defaults: {
      speed: 0.3,
      intensity: 0.5,
      noiseScale: 2.0,
      animated: true,
      animationAngle: 315,
      colors: { ...DEFAULT_COLORS },
      opacity: 1,
      blendMode: 'normal',
      octaves: 4,
      lacunarity: 2.0,
      gain: 0.5,
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
    uniformFields: [
      { key: 'shapeDensity', type: 'float' },
      { key: 'shapeSize', type: 'float' },
      { key: 'sizeVariation', type: 'float' },
      { key: 'shapeMix', type: 'float' },
      { key: 'edgeSoftness', type: 'float' },
      { key: 'rotationSpeed', type: 'float' },
    ],
    managerImport: () => import('./p5/patterns/floating-shapes.p5').then(m => m.FloatingShapesP5Manager),
    defaults: {
      speed: 0.3,
      intensity: 0.5,
      noiseScale: 1.0,
      animated: true,
      animationAngle: 315,
      colors: { ...DEFAULT_COLORS },
      opacity: 1,
      blendMode: 'normal',
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
    uniformFields: [
      { key: 'starCount', type: 'int' },
      { key: 'pointSize', type: 'float' },
      { key: 'connectionDistance', type: 'float' },
      { key: 'lineThickness', type: 'float' },
      { key: 'lineFalloff', type: 'float' },
      { key: 'twinkleIntensity', type: 'float' },
      { key: 'driftSpeed', type: 'float' },
    ],
    managerImport: () => import('./p5/patterns/constellation.p5').then(m => m.ConstellationP5Manager),
    defaults: {
      speed: 0.3,
      intensity: 0.6,
      noiseScale: 1.0,
      animated: true,
      animationAngle: 315,
      colors: { ...DEFAULT_COLORS },
      opacity: 1,
      blendMode: 'normal',
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
    uniformFields: [
      { key: 'lineDensity', type: 'float' },
      { key: 'lineLength', type: 'float' },
      { key: 'lengthVariation', type: 'float' },
      { key: 'lineThickness', type: 'float' },
      { key: 'angleVariation', type: 'float' },
      { key: 'baseAngle', type: 'float' },
      { key: 'crosshatchChance', type: 'float' },
      { key: 'fillRatio', type: 'float' },
    ],
    managerImport: () => import('./p5/patterns/minimal-lines.p5').then(m => m.MinimalLinesP5Manager),
    defaults: {
      speed: 0.3,
      intensity: 0.5,
      noiseScale: 1.0,
      animated: true,
      animationAngle: 315,
      colors: { ...DEFAULT_COLORS },
      opacity: 1,
      blendMode: 'normal',
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
    uniformFields: [
      { key: 'elementDensity', type: 'float' },
      { key: 'dimensionLength', type: 'float' },
      { key: 'lineThickness', type: 'float' },
      { key: 'markerSize', type: 'float' },
      { key: 'bracketSize', type: 'float' },
      { key: 'bracketRatio', type: 'float' },
      { key: 'tickDensity', type: 'int' },
    ],
    managerImport: () => import('./p5/patterns/blueprint.p5').then(m => m.BlueprintP5Manager),
    defaults: {
      speed: 0.2,
      intensity: 0.5,
      noiseScale: 1.0,
      animated: true,
      animationAngle: 315,
      colors: { ...DEFAULT_COLORS },
      opacity: 1,
      blendMode: 'normal',
      elementDensity: 1.0,
      dimensionLength: 0.12,
      lineThickness: 0.001,
      markerSize: 0.006,
      bracketSize: 0.04,
      bracketRatio: 0.3,
      tickDensity: 2
    }
  },
  {
    id: 'geometric-grid',
    internalId: 'geometricGrid',
    name: 'Geometric Grid',
    description: 'Procedural grid lines with animated drift, pulse, and wave effects',
    category: 'geometric',
    supportsFBM: false,
    controlGroups: ['geometricGrid'],
    isNew: true,
    rendererEngine: 'webgl',
    uniformFields: [
      { key: 'gridSize', type: 'float' },
      { key: 'lineWidth', type: 'float' },
      { key: 'animationType', type: 'int' },
    ],
    shaderImport: () => import('./shaders/fragments/geometric/grid.glsl').then(m => m.geometricGridFragmentShader),
    defaults: {
      speed: 0.8,
      intensity: 0.5,
      noiseScale: 1.0,
      animated: true,
      animationAngle: 315,
      colors: { ...DEFAULT_COLORS },
      opacity: 1,
      blendMode: 'normal',
      gridSize: 80,
      lineWidth: 1,
      animationType: 0
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
