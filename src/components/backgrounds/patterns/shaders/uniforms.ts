/**
 * Shared uniform declarations and creation utilities for noise patterns
 */

import * as THREE from 'three';

/** Base uniform declarations (GLSL) - shared by all patterns */
export const baseUniformDeclarations = `
uniform float uTime;
uniform vec2 uResolution;
uniform float uNoiseScale;
uniform float uIntensity;
uniform float uSpeed;
uniform bool uAnimated;
uniform float uAnimationAngle;
uniform vec3 uColorPrimary;
uniform vec3 uColorSecondary;
uniform vec3 uColorTertiary;
`;

/** FBM uniform declarations (GLSL) - for patterns using FBM */
export const fbmUniformDeclarations = `
uniform int uOctaves;
uniform float uLacunarity;
uniform float uGain;
`;

/** Perlin/Simplex specific uniform declarations */
export const perlinSimplexUniformDeclarations = `
uniform float uTimeScaleX;
uniform float uTimeScaleY;
`;

/** Worley/Voronoi specific uniform declarations */
export const worleyUniformDeclarations = `
uniform float uCellScale;
uniform float uCellAnimSpeed;
uniform bool uInvert;
`;

/** Voronoi Edge specific uniform declarations */
export const voronoiEdgeUniformDeclarations = `
uniform float uCellScale;
uniform float uCellAnimSpeed;
uniform float uEdgeThickness;
`;

/** Turbulence specific uniform declarations */
export const turbulenceUniformDeclarations = `
uniform float uSharpness;
`;

/** Ridged specific uniform declarations */
export const ridgedUniformDeclarations = `
uniform float uRidgeSharpness;
uniform float uRidgeTimeScale;
`;

/** Domain Warp specific uniform declarations */
export const domainWarpUniformDeclarations = `
uniform float uWarpStrength;
uniform int uWarpLayers;
`;

/** Caustics specific uniform declarations */
export const causticsUniformDeclarations = `
uniform int uWaveCount;
uniform float uWaveFrequency;
uniform float uWaveSharpness;
uniform float uDetailAmount;
`;

/** Marble specific uniform declarations */
export const marbleUniformDeclarations = `
uniform float uLineFrequency;
uniform float uNoiseInfluence;
uniform float uDetailBlend;
`;

// =============================================================================
// SPARSE GEOMETRIC PATTERN UNIFORM DECLARATIONS
// =============================================================================

/** FloatingShapes specific uniform declarations */
export const floatingShapesUniformDeclarations = `
uniform float uShapeDensity;
uniform float uShapeSize;
uniform float uSizeVariation;
uniform float uShapeMix;
uniform float uEdgeSoftness;
uniform float uRotationSpeed;
`;

/** Constellation specific uniform declarations */
export const constellationUniformDeclarations = `
uniform int uStarCount;
uniform float uPointSize;
uniform float uConnectionDistance;
uniform float uLineThickness;
uniform float uLineFalloff;
uniform float uTwinkleIntensity;
uniform float uDriftSpeed;
`;

/** MinimalLines specific uniform declarations */
export const minimalLinesUniformDeclarations = `
uniform float uLineDensity;
uniform float uLineLength;
uniform float uLengthVariation;
uniform float uLineThickness;
uniform float uAngleVariation;
uniform float uBaseAngle;
uniform float uCrosshatchChance;
uniform float uFillRatio;
`;

/** Blueprint specific uniform declarations */
export const blueprintUniformDeclarations = `
uniform float uElementDensity;
uniform float uDimensionLength;
uniform float uLineThickness;
uniform float uMarkerSize;
uniform float uBracketSize;
uniform float uBracketRatio;
uniform int uTickDensity;
`;

/** Colors configuration type */
export interface ColorsConfig {
  primary?: string;
  secondary?: string;
  tertiary?: string;
}

/** Base configuration shared by all patterns */
export interface BasePatternConfig {
  speed: number;
  intensity: number;
  noiseScale: number;
  animated: boolean;
  animationAngle: number;
  maxPixelRatio: number;
  pauseOffscreen: boolean;
  colors: ColorsConfig;
}

/** @deprecated Use BasePatternConfig instead */
export type BaseNoiseConfig = BasePatternConfig;

/** Create base uniforms object for Three.js */
export function createBaseUniforms(config: BaseNoiseConfig, themeColors: { primary: string; secondary: string; tertiary: string }) {
  return {
    uTime: { value: 0 },
    uResolution: { value: new THREE.Vector2(1, 1) },
    uNoiseScale: { value: config.noiseScale },
    uIntensity: { value: config.intensity },
    uSpeed: { value: config.speed },
    uAnimated: { value: config.animated },
    uAnimationAngle: { value: config.animationAngle },
    uColorPrimary: { value: new THREE.Color(themeColors.primary) },
    uColorSecondary: { value: new THREE.Color(themeColors.secondary) },
    uColorTertiary: { value: new THREE.Color(themeColors.tertiary) }
  };
}

/** Create FBM uniforms object */
export function createFBMUniforms(config: { octaves: number; lacunarity: number; gain: number }) {
  return {
    uOctaves: { value: config.octaves },
    uLacunarity: { value: config.lacunarity },
    uGain: { value: config.gain }
  };
}
