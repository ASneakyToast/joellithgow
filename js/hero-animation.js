// Hero Animation Effects
// Digital whiteboard-style background animations with scroll interactions

class HeroAnimationController {
    constructor() {
        this.hero = document.querySelector('.hero');
        this.scrollY = 0;
        this.ticking = false;
        
        this.init();
    }
    
    init() {
        // Add scroll listener for parallax effects
        window.addEventListener('scroll', () => this.requestTick());
        
        // Add mouse movement for subtle interaction
        this.hero?.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        
        // Add resize listener for responsive adjustments
        window.addEventListener('resize', () => this.handleResize());
        
        // Initialize theme-aware colors
        this.updateThemeColors();
        
        // Listen for theme changes
        this.observeThemeChanges();
    }
    
    requestTick() {
        if (!this.ticking) {
            requestAnimationFrame(() => this.updateScrollEffects());
            this.ticking = true;
        }
    }
    
    updateScrollEffects() {
        this.scrollY = window.pageYOffset;
        
        if (this.hero) {
            const heroHeight = this.hero.offsetHeight;
            const scrollProgress = Math.min(this.scrollY / heroHeight, 1);
            
            // Parallax effect for background layers
            const parallaxSpeed1 = scrollProgress * 30;
            const parallaxSpeed2 = scrollProgress * 50;
            
            // Apply transform to pseudo-elements via CSS custom properties
            this.hero.style.setProperty('--scroll-y', `${this.scrollY}px`);
            this.hero.style.setProperty('--parallax-1', `${parallaxSpeed1}px`);
            this.hero.style.setProperty('--parallax-2', `${parallaxSpeed2}px`);
            this.hero.style.setProperty('--scroll-progress', scrollProgress);
        }
        
        this.ticking = false;
    }
    
    handleMouseMove(e) {
        if (!this.hero) return;
        
        const rect = this.hero.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
        
        // Subtle mouse tracking effect
        const moveX = (x - 0.5) * 20;
        const moveY = (y - 0.5) * 20;
        
        this.hero.style.setProperty('--mouse-x', `${moveX}px`);
        this.hero.style.setProperty('--mouse-y', `${moveY}px`);
    }
    
    handleResize() {
        // Adjust animation intensity based on screen size
        const isMobile = window.innerWidth < 768;
        this.hero?.style.setProperty('--animation-intensity', isMobile ? '0.5' : '1');
    }
    
    updateThemeColors() {
        // Get current theme colors for dynamic background
        const computedStyle = getComputedStyle(document.documentElement);
        const accentPrimary = computedStyle.getPropertyValue('--accent-primary').trim();
        const accentSecondary = computedStyle.getPropertyValue('--accent-secondary').trim();
        const accentTertiary = computedStyle.getPropertyValue('--accent-tertiary').trim();
        
        // Update CSS custom properties for theme-aware animations
        this.hero?.style.setProperty('--dynamic-primary', accentPrimary);
        this.hero?.style.setProperty('--dynamic-secondary', accentSecondary);
        this.hero?.style.setProperty('--dynamic-tertiary', accentTertiary);
    }
    
    observeThemeChanges() {
        // Watch for theme changes on the document element
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
                    // Slight delay to ensure CSS variables are updated
                    setTimeout(() => this.updateThemeColors(), 50);
                }
            });
        });
        
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['data-theme']
        });
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new HeroAnimationController();
    });
} else {
    new HeroAnimationController();
}