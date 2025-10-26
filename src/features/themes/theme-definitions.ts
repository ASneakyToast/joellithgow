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
      '--gradient-tertiary-medium': 'rgba(255, 230, 109, 0.5)'
    },
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
      '--gradient-tertiary-medium': 'rgba(102, 102, 102, 0.5)'
    }
  }
];