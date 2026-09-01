// Theme type definitions
export interface Theme {
  name: string;
  displayName: string;
  description: string;
  colors: string[];
  cssVariables: Record<string, string>;
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