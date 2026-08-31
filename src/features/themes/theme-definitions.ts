import type { Theme } from './theme-types';

export const themes: Theme[] = [
  {
    name: 'default',
    displayName: 'default',
    description: 'warm & creative',
    colors: ['#ff6b6b', '#4ecdc4', '#ffe66d'],
    cssVariables: {
      '--accent-primary': '#ff6b6b',
      '--accent-secondary': '#4ecdc4',
      '--accent-tertiary': '#ffe66d',
      '--bg-primary': '#f8f8f8',
      '--bg-secondary': 'white',
      '--bg-dark': '#333',
      '--text-primary': '#333',
      '--text-secondary': '#666',
      '--text-light': 'white',
      '--gradient-primary-light': 'rgba(255, 107, 107, 0.25)',
      '--gradient-primary-medium': 'rgba(255, 107, 107, 0.4)',
      '--gradient-primary-dim': 'rgba(255, 107, 107, 0.3)',
      '--gradient-primary-subtle': 'rgba(255, 107, 107, 0.15)',
      '--gradient-secondary-medium': 'rgba(78, 205, 196, 0.6)',
      '--gradient-secondary-light': 'rgba(78, 205, 196, 0.5)',
      '--gradient-secondary-dim': 'rgba(78, 205, 196, 0.2)',
      '--gradient-secondary-subtle': 'rgba(78, 205, 196, 0.15)',
      '--gradient-tertiary-light': 'rgba(255, 230, 109, 0.4)',
      '--gradient-tertiary-medium': 'rgba(255, 230, 109, 0.5)',
      '--grid-size': '80px',
      '--grid-opacity': '1',
      '--grid-anim-speed': '1'
    },
    // Warm & playful → drifting geometric shapes.
    background: { pattern: 'floatingShapes' },
    isDefault: true
  },
  {
    name: 'minimal',
    displayName: 'minimal',
    description: 'monochrome & clean',
    colors: ['#000000', '#333333', '#666666'],
    cssVariables: {
      '--accent-primary': '#000000',
      '--accent-secondary': '#333333',
      '--accent-tertiary': '#666666',
      '--bg-primary': '#ffffff',
      '--bg-secondary': '#f8f8f8',
      '--bg-dark': '#000000',
      '--text-primary': '#000000',
      '--text-secondary': '#555555',
      '--text-light': '#ffffff',
      '--gradient-primary-light': 'rgba(0, 0, 0, 0.25)',
      '--gradient-primary-medium': 'rgba(0, 0, 0, 0.4)',
      '--gradient-primary-dim': 'rgba(0, 0, 0, 0.3)',
      '--gradient-primary-subtle': 'rgba(0, 0, 0, 0.15)',
      '--gradient-secondary-medium': 'rgba(51, 51, 51, 0.6)',
      '--gradient-secondary-light': 'rgba(51, 51, 51, 0.5)',
      '--gradient-secondary-dim': 'rgba(51, 51, 51, 0.2)',
      '--gradient-secondary-subtle': 'rgba(51, 51, 51, 0.15)',
      '--gradient-tertiary-light': 'rgba(102, 102, 102, 0.4)',
      '--gradient-tertiary-medium': 'rgba(102, 102, 102, 0.5)',
      '--grid-size': '100px',
      '--grid-opacity': '0.4',
      '--grid-anim-speed': '1.6'
    },
    // Monochrome & quiet → sparse diagonal hatching.
    background: { pattern: 'minimalLines' }
  },
  {
    name: 'broadsheet',
    displayName: 'broadsheet',
    description: 'serif & tight',
    colors: ['#274060', '#5f8d7e', '#c08552'],
    cssVariables: {
      '--accent-primary': '#274060',    /* indigo ink */
      '--accent-secondary': '#5f8d7e',  /* sage */
      '--accent-tertiary': '#c08552',   /* clay */
      '--bg-primary': '#faf8f3',
      '--bg-secondary': '#ffffff',
      '--bg-dark': '#1a1a1a',
      '--text-primary': '#1a1a1a',
      '--text-secondary': '#55514a',
      '--text-light': '#ffffff',
      '--gradient-primary-light': 'rgba(39, 64, 96, 0.20)',
      '--gradient-primary-medium': 'rgba(39, 64, 96, 0.35)',
      '--gradient-primary-dim': 'rgba(39, 64, 96, 0.28)',
      '--gradient-primary-subtle': 'rgba(39, 64, 96, 0.12)',
      '--gradient-secondary-medium': 'rgba(95, 141, 126, 0.5)',
      '--gradient-secondary-light': 'rgba(95, 141, 126, 0.4)',
      '--gradient-secondary-dim': 'rgba(95, 141, 126, 0.2)',
      '--gradient-secondary-subtle': 'rgba(95, 141, 126, 0.12)',
      '--gradient-tertiary-light': 'rgba(192, 133, 82, 0.35)',
      '--gradient-tertiary-medium': 'rgba(192, 133, 82, 0.45)',
      '--grid-size': '60px',
      '--grid-opacity': '0.85',
      '--grid-anim-speed': '1.25'
    },
    // Editorial & structured → technical blueprint dimension lines.
    background: { pattern: 'blueprint' }
  }
];