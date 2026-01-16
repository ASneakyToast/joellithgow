/**
 * Type definitions for p5.js pattern managers
 */

import type { P5PatternManagerConfig } from './P5PatternManager';

/** Constellation pattern configuration */
export interface ConstellationConfig extends P5PatternManagerConfig {
  starCount: number;
  pointSize: number;
  connectionDistance: number;
  lineThickness: number;
  lineFalloff: number;
  twinkleIntensity: number;
  driftSpeed: number;
}

/** Blueprint pattern configuration */
export interface BlueprintConfig extends P5PatternManagerConfig {
  elementDensity: number;
  dimensionLength: number;
  lineThickness: number;
  markerSize: number;
  bracketSize: number;
  bracketRatio: number;
  tickDensity: number;
}

/** Floating shapes pattern configuration */
export interface FloatingShapesConfig extends P5PatternManagerConfig {
  shapeDensity: number;
  shapeSize: number;
  sizeVariation: number;
  shapeMix: number;
  edgeSoftness: number;
  rotationSpeed: number;
}

/** Minimal lines pattern configuration */
export interface MinimalLinesConfig extends P5PatternManagerConfig {
  lineDensity: number;
  lineLength: number;
  lengthVariation: number;
  lineThickness: number;
  angleVariation: number;
  baseAngle: number;
  crosshatchChance: number;
  fillRatio: number;
}

/** Star data structure for constellation pattern */
export interface Star {
  baseX: number;
  baseY: number;
  phase: number;
  orbitSpeed: number;
}

/** Shape data structure for floating shapes pattern */
export interface Shape {
  x: number;
  y: number;
  type: 'circle' | 'triangle' | 'hexagon';
  size: number;
  rotation: number;
  rotationSpeed: number;
  driftPhase: number;
  driftSpeed: number;
}

/** Element data structure for blueprint pattern */
export interface BlueprintElement {
  x: number;
  y: number;
  type: 'dimension' | 'bracket';
  angle: number;
  length: number;
  rotation: number;
  driftPhase: number;
}

/** Line data structure for minimal lines pattern */
export interface LineElement {
  x: number;
  y: number;
  angle: number;
  length: number;
  hasCrosshatch: boolean;
  crosshatchLength: number;
  driftPhase: number;
}
