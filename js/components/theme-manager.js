// js/components/theme-manager.js
// Theme Manager Module - Handles theme switching, persistence, modal controls

import { themes, themeConfig, themeUtils } from '../data/themes.js';
import scrollManager from '../utils/scroll-manager.js';

// Theme Management Functions
function setTheme(theme, updateFromKeyboard = false) {
    // Add smooth transition
    document.documentElement.style.transition = 'all 0.3s ease';
    
    // Set data-theme attribute for CSS selectors
    document.documentElement.setAttribute('data-theme', theme);
    
    // ALSO apply CSS variables directly for immediate effect
    const themeData = themeUtils.getThemeByName(theme);
    if (themeData) {
        themeUtils.applyCSSVariables(themeData);
    }
    
    localStorage.setItem('portfolio-theme', theme);
    themeConfig.current = theme;
    
    // Update active state
    document.querySelectorAll('.theme-option').forEach(option => {
        option.classList.remove('active');
    });
    
    const activeOption = document.querySelector(`[data-theme="${theme}"]`);
    if (activeOption) {
        activeOption.classList.add('active');
    }
    
    // Show brief notification for keyboard changes
    if (updateFromKeyboard) {
        showThemeNotification(theme);
    }
    
    // Remove transition after change
    setTimeout(() => {
        document.documentElement.style.transition = '';
    }, 300);
}

function loadTheme() {
    const savedTheme = localStorage.getItem('portfolio-theme') || 'default';
    themeConfig.current = savedTheme;
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    // Apply CSS variables directly
    const themeData = themeUtils.getThemeByName(savedTheme);
    if (themeData) {
        themeUtils.applyCSSVariables(themeData);
    }
    
    // Update active state
    document.querySelectorAll('.theme-option').forEach(option => {
        option.classList.remove('active');
        if (option.dataset.theme === savedTheme) {
            option.classList.add('active');
        }
    });
}

function cycleTheme() {
    const currentTheme = themeUtils.getThemeByName(themeConfig.current);
    const nextTheme = themeUtils.getNextTheme(themeConfig.current);
    setTheme(nextTheme.name, true);
}

function openThemeModal() {
    const modal = document.getElementById('themeModal');
    if (modal) {
        modal.classList.add('show');
        scrollManager.lockBodyScroll();
        themeConfig.modalOpen = true;
    }
}

function closeThemeModal() {
    const modal = document.getElementById('themeModal');
    if (modal) {
        modal.classList.remove('show');
        scrollManager.restoreBodyScroll();
        themeConfig.modalOpen = false;
    }
}

function showThemeNotification(theme) {
    const themeData = themeUtils.getThemeByName(theme);
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: var(--bg-dark);
        color: var(--text-light);
        padding: 20px 30px;
        border: 3px solid var(--accent-primary);
        box-shadow: 8px 8px 0px var(--accent-secondary);
        font-size: 18px;
        font-weight: bold;
        text-transform: uppercase;
        letter-spacing: 1px;
        z-index: 10001;
        pointer-events: none;
        opacity: 0;
        transition: all 0.3s ease;
        font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    `;
    
    notification.textContent = `Theme: ${themeData.displayName}`;
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translate(-50%, -50%) scale(1.05)';
    }, 10);
    
    // Animate out and remove
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translate(-50%, -50%) scale(0.95)';
    }, 1500);
    
    setTimeout(() => {
        notification.remove();
    }, 1800);
}

function previewTheme(theme) {
    const option = document.querySelector(`[data-theme="${theme}"]`);
    if (option) {
        option.classList.add('preview');
        // Briefly apply theme for preview
        document.documentElement.style.transition = 'all 0.2s ease';
        document.documentElement.setAttribute('data-theme', theme);
    }
}

function clearThemePreview() {
    // Remove preview state
    document.querySelectorAll('.theme-option').forEach(option => {
        option.classList.remove('preview');
    });
    
    // Restore current theme
    document.documentElement.setAttribute('data-theme', themeConfig.current);
    
    setTimeout(() => {
        document.documentElement.style.transition = '';
    }, 200);
}

// Apply theme CSS variables programmatically
function applyThemeVariables(theme) {
    const themeData = themeUtils.getThemeByName(theme);
    if (themeData) {
        themeUtils.applyCSSVariables(themeData);
    }
}

// Generate theme CSS for dynamic loading
function generateThemeCSS(theme) {
    const themeData = themeUtils.getThemeByName(theme);
    return themeData ? themeUtils.generateThemeCSS(themeData) : '';
}

// Initialize theme system
function initThemeSystem() {
    // Load saved theme
    loadTheme();
    
    // Initialize theme options if they exist
    const themeOptions = document.querySelectorAll('.theme-option');
    themeOptions.forEach(option => {
        option.addEventListener('click', () => {
            setTheme(option.dataset.theme);
        });
    });
    
    // Initialize theme control button
    const themeControl = document.getElementById('themeControl');
    if (themeControl) {
        themeControl.addEventListener('click', openThemeModal);
    }
    
    // Initialize theme modal close button
    const themeModalClose = document.querySelector('.theme-modal-close');
    if (themeModalClose) {
        themeModalClose.addEventListener('click', closeThemeModal);
    }
}

// Export functions for use in other modules
export {
    setTheme,
    loadTheme,
    cycleTheme,
    openThemeModal,
    closeThemeModal,
    showThemeNotification,
    previewTheme,
    clearThemePreview,
    applyThemeVariables,
    generateThemeCSS,
    initThemeSystem
};