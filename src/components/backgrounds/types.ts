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
  /** Grid cell size in pixels (default: 80) */
  gridSize?: number;
  /** Line thickness in pixels (default: 1) */
  lineWidth?: number;
  /** Animation type (default: 'drift') */
  animationType?: 'drift' | 'pulse' | 'wave';
}
