import type { PatternType } from '@components/backgrounds/patterns/registry';

/**
 * The animated background a theme paints behind the whole site. `pattern` is a
 * pattern internalId from the background registry; `config` optionally overrides
 * that pattern's registry defaults (speed, density, etc.). The ThemeBackground
 * controller swaps this live whenever the active theme changes.
 */
export interface ThemeBackground {
  pattern: PatternType;
  config?: Record<string, number | boolean>;
}

// Theme type definitions
export interface Theme {
  name: string;
  displayName: string;
  description: string;
  colors: string[];
  cssVariables: Record<string, string>;
  background?: ThemeBackground;
  darkModeVariables?: Record<string, string>;
  isDefault?: boolean;
  isSystem?: boolean;
  isHighContrast?: boolean;
}

export interface ThemeConfig {
  themes: string[];
  current: string;
  modalOpen: boolean;
  keyboardShortcut: string;
}