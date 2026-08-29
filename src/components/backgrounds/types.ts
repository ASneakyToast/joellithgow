/**
 * WebGL Background Component Types
 *
 * This file re-exports all types from the patterns module for backward compatibility.
 * For new code, import directly from '@components/backgrounds/patterns/types'.
 */

// Re-export everything from patterns types
export * from './patterns/types';

// Re-export from registry
export {
  PATTERNS,
  getPatternById,
  getPatternByInternalId,
  getPatternsByCategory,
  getAllPatternIds,
  getAllInternalIds
} from './patterns/registry';

// Geometric Grid Props (legacy, not part of pattern system)
export interface GeometricGridProps {
  /** Animation type (default: 'drift') */
  animationType?: 'drift' | 'pulse' | 'wave';
  /** Optional class on the container */
  class?: string;
  /** Explicit primary/secondary colors; falls back to theme CSS vars */
  colors?: Record<string, string>;
  /** Grid cell size in pixels (default: 80) */
  gridSize?: number;
  /** Optional container id */
  id?: string;
  /** Line thickness in pixels (default: 1) */
  lineWidth?: number;
  /** Animation intensity, 0–1 (default: 0.5) */
  intensity?: number;
  /** Cap on devicePixelRatio (default: 2) */
  maxPixelRatio?: number;
  /** Pause rendering when offscreen (default: true) */
  pauseOffscreen?: boolean;
  /** Animation speed multiplier (default: 1.0) */
  speed?: number;
}
