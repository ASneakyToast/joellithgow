// js/data/themes.js
const themes = [
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
            '--text-light': 'white'
        },
        isDefault: true
    },
    {
        name: 'electric',
        displayName: 'electric',
        description: 'neon & bold',
        colors: ['#00ffff', '#ff00ff', '#ffff00'],
        cssVariables: {
            '--accent-primary': '#00ffff',
            '--accent-secondary': '#ff00ff',
            '--accent-tertiary': '#ffff00',
            '--bg-primary': '#0a0a0a',
            '--bg-secondary': '#1a1a1a',
            '--bg-dark': '#000',
            '--text-primary': '#fff',
            '--text-secondary': '#ccc',
            '--text-light': '#fff'
        }
    },
    {
        name: 'retro',
        displayName: 'retro',
        description: 'vintage & soft',
        colors: ['#ff8c42', '#6699cc', '#ffcc5c'],
        cssVariables: {
            '--accent-primary': '#ff8c42',
            '--accent-secondary': '#6699cc',
            '--accent-tertiary': '#ffcc5c',
            '--bg-primary': '#fdf6e3',
            '--bg-secondary': '#ffffff',
            '--bg-dark': '#657b83',
            '--text-primary': '#586e75',
            '--text-secondary': '#93a1a1',
            '--text-light': '#ffffff'
        }
    },
    {
        name: 'minimal',
        displayName: 'minimal',
        description: 'clean & focused',
        colors: ['#007acc', '#5c6bc0', '#26c6da'],
        cssVariables: {
            '--accent-primary': '#007acc',
            '--accent-secondary': '#5c6bc0',
            '--accent-tertiary': '#26c6da',
            '--bg-primary': '#ffffff',
            '--bg-secondary': '#f8f9fa',
            '--bg-dark': '#212529',
            '--text-primary': '#212529',
            '--text-secondary': '#6c757d',
            '--text-light': '#ffffff'
        }
    },
    {
        name: 'system',
        displayName: 'system',
        description: 'auto light/dark',
        colors: [
            'linear-gradient(45deg, #ffffff 50%, #0a0a0a 50%)',
            'linear-gradient(45deg, #007acc 50%, #00ffff 50%)',
            'linear-gradient(45deg, #f8f9fa 50%, #1a1a1a 50%)'
        ],
        cssVariables: {
            '--accent-primary': '#007acc',
            '--accent-secondary': '#5c6bc0',
            '--accent-tertiary': '#26c6da',
            '--bg-primary': '#ffffff',
            '--bg-secondary': '#f8f9fa',
            '--bg-dark': '#212529',
            '--text-primary': '#212529',
            '--text-secondary': '#6c757d',
            '--text-light': '#ffffff'
        },
        darkModeVariables: {
            '--accent-primary': '#00ffff',
            '--accent-secondary': '#ff00ff',
            '--accent-tertiary': '#ffff00',
            '--bg-primary': '#0a0a0a',
            '--bg-secondary': '#1a1a1a',
            '--bg-dark': '#000',
            '--text-primary': '#fff',
            '--text-secondary': '#ccc',
            '--text-light': '#fff'
        },
        isSystem: true
    },
    {
        name: 'high-contrast',
        displayName: 'high contrast',
        description: 'accessibility',
        colors: ['#ffffff', '#ffff00', '#00ffff'],
        cssVariables: {
            '--accent-primary': '#ffffff',
            '--accent-secondary': '#ffff00',
            '--accent-tertiary': '#00ffff',
            '--bg-primary': '#000000',
            '--bg-secondary': '#111111',
            '--bg-dark': '#ffffff',
            '--text-primary': '#ffffff',
            '--text-secondary': '#ffffff',
            '--text-light': '#000000'
        },
        isHighContrast: true
    },
    {
        name: 'neon',
        displayName: 'neon',
        description: 'cyberpunk glow',
        colors: ['#ff073a', '#39ff14', '#ff073a'],
        cssVariables: {
            '--accent-primary': '#ff073a',
            '--accent-secondary': '#39ff14',
            '--accent-tertiary': '#ff073a',
            '--bg-primary': '#0d0d0d',
            '--bg-secondary': '#1a0a1a',
            '--bg-dark': '#ff073a',
            '--text-primary': '#39ff14',
            '--text-secondary': '#ff073a',
            '--text-light': '#0d0d0d'
        }
    }
];

const themeConfig = {
    themes: themes.map(theme => theme.name),
    current: 'default',
    modalOpen: false,
    keyboardShortcut: 'Ctrl+T'
};

// Theme utility functions
const themeUtils = {
    getThemeByName(name) {
        return themes.find(theme => theme.name === name);
    },
    
    getDefaultTheme() {
        return themes.find(theme => theme.isDefault) || themes[0];
    },
    
    getCurrentThemeIndex(currentTheme) {
        return themes.findIndex(theme => theme.name === currentTheme);
    },
    
    getNextTheme(currentTheme) {
        const currentIndex = this.getCurrentThemeIndex(currentTheme);
        const nextIndex = (currentIndex + 1) % themes.length;
        return themes[nextIndex];
    },
    
    getPreviousTheme(currentTheme) {
        const currentIndex = this.getCurrentThemeIndex(currentTheme);
        const prevIndex = currentIndex === 0 ? themes.length - 1 : currentIndex - 1;
        return themes[prevIndex];
    },
    
    applyCSSVariables(theme) {
        const root = document.documentElement;
        Object.entries(theme.cssVariables).forEach(([property, value]) => {
            root.style.setProperty(property, value);
        });
    },
    
    generateThemeCSS(theme) {
        const selector = theme.isDefault ? ':root' : `[data-theme="${theme.name}"]`;
        const variables = Object.entries(theme.cssVariables)
            .map(([property, value]) => `            ${property}: ${value};`)
            .join('\n');
        
        let css = `        ${selector} {\n${variables}\n        }`;
        
        // Add dark mode variables for system theme
        if (theme.isSystem && theme.darkModeVariables) {
            const darkVariables = Object.entries(theme.darkModeVariables)
                .map(([property, value]) => `                ${property}: ${value};`)
                .join('\n');
            css += `\n        \n        @media (prefers-color-scheme: dark) {\n            [data-theme="system"] {\n${darkVariables}\n            }\n        }`;
        }
        
        return css;
    }
};

export { themes, themeConfig, themeUtils };
export default themes;