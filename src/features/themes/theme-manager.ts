import type { Theme, ThemeConfig } from './theme-types';
import { themes } from './theme-definitions';

export const themeConfig: ThemeConfig = {
  themes: themes.map(theme => theme.name),
  current: 'default',
  modalOpen: false,
  keyboardShortcut: 'Ctrl+T'
};

// Theme utility functions
export const themeUtils = {
  getThemeByName(name: string): Theme | undefined {
    return themes.find(theme => theme.name === name);
  },

  getDefaultTheme(): Theme {
    return themes.find(theme => theme.isDefault) || themes[0];
  },

  getCurrentThemeIndex(currentTheme: string): number {
    return themes.findIndex(theme => theme.name === currentTheme);
  },

  getNextTheme(currentTheme: string): Theme {
    const currentIndex = this.getCurrentThemeIndex(currentTheme);
    const nextIndex = (currentIndex + 1) % themes.length;
    return themes[nextIndex];
  },

  getPreviousTheme(currentTheme: string): Theme {
    const currentIndex = this.getCurrentThemeIndex(currentTheme);
    const prevIndex = currentIndex === 0 ? themes.length - 1 : currentIndex - 1;
    return themes[prevIndex];
  },

  applyCSSVariables(theme: Theme): void {
    const root = document.documentElement;
    Object.entries(theme.cssVariables).forEach(([property, value]) => {
      root.style.setProperty(property, value);
    });
  },

  generateThemeCSS(theme: Theme): string {
    const selector = theme.isDefault ? ':root' : `[data-theme="${theme.name}"]`;
    const variables = Object.entries(theme.cssVariables)
      .map(([property, value]) => `  ${property}: ${value};`)
      .join('\n');

    let css = `${selector} {\n${variables}\n}`;

    // Add dark mode variables for system theme
    if (theme.isSystem && theme.darkModeVariables) {
      const darkVariables = Object.entries(theme.darkModeVariables)
        .map(([property, value]) => `    ${property}: ${value};`)
        .join('\n');
      css += `\n\n@media (prefers-color-scheme: dark) {\n  [data-theme="system"] {\n${darkVariables}\n  }\n}`;
    }

    return css;
  }
};