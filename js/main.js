// js/main.js
// Main App Module - Handles app initialization, event delegation, and coordination

import { 
    initThemeSystem,
    loadTheme, 
    cycleTheme, 
    closeThemeModal, 
    setTheme,
    openThemeModal
} from './components/theme-manager.js';

import { 
    closeModal,
    initProjectCards,
    initCaseStudyModal,
    renderProjectCards
} from './components/project-cards.js';

import {
    initAllUIInteractions
} from './components/ui-interactions.js';

import { ComponentFactory } from './components/ui-components.js';
import projects from './data/projects.js';
import content from './data/content.js';
import { themes } from './data/themes.js';

// Global configuration
const appConfig = {
    initialized: false,
    theme: 'default',
    version: '1.0.0'
};

// Initialize the application
function initApp() {
    if (appConfig.initialized) return;
    
    console.log('Initializing Portfolio App v' + appConfig.version);
    
    // Initialize theme system
    initThemeSystem();
    
    // Initialize project cards
    initProjectCards();
    initCaseStudyModal();
    
    // Initialize UI interactions
    initAllUIInteractions();
    
    // Initialize global event listeners
    initGlobalEventListeners();
    
    // Initialize dynamic content rendering
    initDynamicContent();
    
    appConfig.initialized = true;
    console.log('Portfolio App initialized successfully');
}

// Initialize dynamic content rendering
function initDynamicContent() {
    // Render projects if container exists
    const projectsContainer = document.querySelector('.projects-container');
    if (projectsContainer) {
        renderProjectCards(projectsContainer);
    }
    
    // Render theme modal if it doesn't exist
    const themeModal = document.getElementById('themeModal');
    if (!themeModal) {
        const themeModalHTML = ComponentFactory.generateThemeModal(themes, 'default');
        document.body.insertAdjacentHTML('beforeend', themeModalHTML);
    }
    
    // Render floating elements if they don't exist
    const floatingElements = document.querySelectorAll('.floating-element');
    if (floatingElements.length === 0 && content.hero.floatingElements) {
        const heroSection = document.querySelector('.hero');
        if (heroSection) {
            const floatingHTML = ComponentFactory.generateHeroFloatingElements(content.hero.floatingElements);
            heroSection.insertAdjacentHTML('beforeend', floatingHTML);
        }
    }
}

// Global event listeners
function initGlobalEventListeners() {
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Ctrl+T or Cmd+T to cycle themes
        if ((e.ctrlKey || e.metaKey) && e.key === 't') {
            e.preventDefault();
            cycleTheme();
        }
        
        // Escape to close modals
        if (e.key === 'Escape') {
            closeThemeModal();
            closeModal();
        }
    });
    
    // Theme modal click outside to close
    document.addEventListener('click', (e) => {
        const themeModal = document.getElementById('themeModal');
        if (themeModal && e.target === themeModal) {
            closeThemeModal();
        }
        
        const caseStudyModal = document.getElementById('caseStudyModal');
        if (caseStudyModal && e.target === caseStudyModal) {
            closeModal();
        }
    });
    
    // Handle window resize
    window.addEventListener('resize', debounce(() => {
        // Recalculate any layout-dependent elements
        const floatingElements = document.querySelectorAll('.floating-element');
        floatingElements.forEach(element => {
            if (element.style.left && element.style.top) {
                // Ensure elements stay within viewport
                const rect = element.getBoundingClientRect();
                const maxX = window.innerWidth - rect.width;
                const maxY = window.innerHeight - rect.height;
                
                const currentX = parseInt(element.style.left);
                const currentY = parseInt(element.style.top);
                
                if (currentX > maxX) element.style.left = maxX + 'px';
                if (currentY > maxY) element.style.top = maxY + 'px';
            }
        });
    }, 250));
    
    // Handle visibility change (for performance optimization)
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            // Pause any heavy animations when tab is not visible
            document.querySelectorAll('.floating-element').forEach(element => {
                element.style.animationPlayState = 'paused';
            });
        } else {
            // Resume animations when tab becomes visible
            document.querySelectorAll('.floating-element').forEach(element => {
                element.style.animationPlayState = 'running';
            });
        }
    });
}

// Utility function: debounce
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Error handling
function handleError(error) {
    console.error('Portfolio App Error:', error);
    
    // Show user-friendly error message
    const errorNotification = document.createElement('div');
    errorNotification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #ff4444;
        color: white;
        padding: 15px 20px;
        border-radius: 4px;
        z-index: 10000;
        font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
        font-size: 14px;
        max-width: 300px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    `;
    
    errorNotification.textContent = 'An error occurred. Please refresh the page.';
    document.body.appendChild(errorNotification);
    
    setTimeout(() => {
        errorNotification.remove();
    }, 5000);
}

// Global error handler
window.addEventListener('error', (event) => {
    handleError(event.error);
});

window.addEventListener('unhandledrejection', (event) => {
    handleError(event.reason);
});

// Performance monitoring
function initPerformanceMonitoring() {
    if ('performance' in window) {
        window.addEventListener('load', () => {
            setTimeout(() => {
                const perfData = performance.getEntriesByType('navigation')[0];
                if (perfData) {
                    console.log('Performance metrics:', {
                        domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
                        loadComplete: perfData.loadEventEnd - perfData.loadEventStart,
                        totalTime: perfData.loadEventEnd - perfData.navigationStart
                    });
                }
            }, 0);
        });
    }
}

// DOM Content Loaded event
document.addEventListener('DOMContentLoaded', () => {
    initApp();
    initPerformanceMonitoring();
});

// Make global functions available (for onclick handlers in HTML)
window.openThemeModal = openThemeModal;
window.closeThemeModal = closeThemeModal;
window.setTheme = setTheme;
window.closeModal = closeModal;

// Expose app configuration for debugging
window.portfolioApp = {
    config: appConfig,
    projects,
    content,
    themes,
    ComponentFactory,
    reinitialize: initApp
};

// Export for potential external use
export {
    appConfig,
    initApp,
    initGlobalEventListeners,
    handleError,
    debounce
};