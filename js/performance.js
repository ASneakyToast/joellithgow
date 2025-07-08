// js/performance.js
// Performance optimization utilities

// Lazy loading for images
function initLazyLoading() {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                observer.unobserve(img);
            }
        });
    });

    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });
}

// Critical CSS inlining
function loadNonCriticalCSS() {
    const cssFiles = [
        'css/animations.css',
        'css/responsive.css'
    ];
    
    cssFiles.forEach(href => {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = href;
        link.media = 'print';
        link.onload = function() {
            this.media = 'all';
        };
        document.head.appendChild(link);
    });
}

// Resource prefetching
function prefetchResources() {
    const criticalResources = [
        'js/data/projects.js',
        'js/data/themes.js',
        'js/data/content.js'
    ];
    
    criticalResources.forEach(href => {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = href;
        document.head.appendChild(link);
    });
}

// Service Worker registration
async function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        try {
            const registration = await navigator.serviceWorker.register('/sw.js');
            console.log('Service Worker registered successfully:', registration.scope);
            
            // Update available
            registration.addEventListener('updatefound', () => {
                const newWorker = registration.installing;
                newWorker.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        showUpdateNotification();
                    }
                });
            });
            
        } catch (error) {
            console.log('Service Worker registration failed:', error);
        }
    }
}

// Show update notification
function showUpdateNotification() {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 20px;
        background: var(--bg-dark);
        color: var(--text-light);
        padding: 15px 20px;
        border: 2px solid var(--accent-primary);
        box-shadow: 4px 4px 0px var(--accent-secondary);
        font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
        font-size: 14px;
        z-index: 10000;
        max-width: 300px;
        transform: translateY(100px);
        transition: transform 0.3s ease;
    `;
    
    notification.innerHTML = `
        <div style="margin-bottom: 10px;">New version available!</div>
        <button onclick="location.reload()" style="
            background: var(--accent-primary);
            color: var(--text-light);
            border: none;
            padding: 5px 10px;
            font-family: inherit;
            font-size: 12px;
            cursor: pointer;
            margin-right: 10px;
        ">Update</button>
        <button onclick="this.parentNode.remove()" style="
            background: transparent;
            color: var(--text-light);
            border: 1px solid var(--text-light);
            padding: 5px 10px;
            font-family: inherit;
            font-size: 12px;
            cursor: pointer;
        ">Later</button>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.transform = 'translateY(0)';
    }, 100);
}

// Performance monitoring
function initPerformanceMonitoring() {
    // Core Web Vitals
    if ('web-vital' in window) {
        getCLS(logCLS);
        getFID(logFID);
        getLCP(logLCP);
    }
    
    // Custom performance metrics
    window.addEventListener('load', () => {
        setTimeout(() => {
            const perfData = performance.getEntriesByType('navigation')[0];
            const paintData = performance.getEntriesByType('paint');
            
            const metrics = {
                // Navigation Timing
                domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
                loadComplete: perfData.loadEventEnd - perfData.loadEventStart,
                totalTime: perfData.loadEventEnd - perfData.navigationStart,
                
                // Paint Timing
                firstPaint: paintData.find(entry => entry.name === 'first-paint')?.startTime,
                firstContentfulPaint: paintData.find(entry => entry.name === 'first-contentful-paint')?.startTime,
                
                // Resource counts
                totalResources: performance.getEntriesByType('resource').length,
                
                // Memory usage (if available)
                usedJSHeapSize: performance.memory?.usedJSHeapSize,
                totalJSHeapSize: performance.memory?.totalJSHeapSize
            };
            
            console.log('Performance Metrics:', metrics);
            
            // Send to analytics if configured
            if (window.gtag) {
                window.gtag('event', 'page_performance', {
                    custom_parameter: {
                        load_time: metrics.totalTime,
                        dom_content_loaded: metrics.domContentLoaded,
                        first_contentful_paint: metrics.firstContentfulPaint
                    }
                });
            }
        }, 0);
    });
}

// Optimize images
function optimizeImages() {
    const images = document.querySelectorAll('img');
    
    images.forEach(img => {
        // Add loading attribute for native lazy loading
        if (!img.hasAttribute('loading')) {
            img.loading = 'lazy';
        }
        
        // Add appropriate sizes attribute for responsive images
        if (!img.hasAttribute('sizes') && img.srcset) {
            img.sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw';
        }
    });
}

// Debounce function for performance
function debounce(func, wait, immediate) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            timeout = null;
            if (!immediate) func(...args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func(...args);
    };
}

// Throttle function for performance
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Font loading optimization
function optimizeFonts() {
    // Preload critical fonts
    const fontFaces = [
        {
            family: 'Monaco',
            src: 'url("/fonts/monaco.woff2") format("woff2")',
            display: 'swap'
        }
    ];
    
    fontFaces.forEach(font => {
        const fontFace = new FontFace(font.family, font.src, {
            display: font.display
        });
        
        fontFace.load().then(loadedFont => {
            document.fonts.add(loadedFont);
        }).catch(error => {
            console.warn('Font loading failed:', error);
        });
    });
}

// Critical resource prioritization
function prioritizeResources() {
    // Preload critical assets
    const criticalAssets = [
        { href: 'css/themes.css', as: 'style' },
        { href: 'css/layout.css', as: 'style' },
        { href: 'js/main.js', as: 'script' }
    ];
    
    criticalAssets.forEach(asset => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = asset.href;
        link.as = asset.as;
        if (asset.as === 'script') {
            link.crossOrigin = 'anonymous';
        }
        document.head.appendChild(link);
    });
}

// Initialize all performance optimizations
function initPerformanceOptimizations() {
    // Immediate optimizations
    optimizeImages();
    prioritizeResources();
    
    // Deferred optimizations
    requestIdleCallback(() => {
        initLazyLoading();
        loadNonCriticalCSS();
        prefetchResources();
        optimizeFonts();
        initPerformanceMonitoring();
        registerServiceWorker();
    });
}

// Web Vitals logging functions
function logCLS(metric) {
    console.log('CLS:', metric.value);
}

function logFID(metric) {
    console.log('FID:', metric.value);
}

function logLCP(metric) {
    console.log('LCP:', metric.value);
}

// Export for use in other modules
export {
    initLazyLoading,
    loadNonCriticalCSS,
    prefetchResources,
    registerServiceWorker,
    initPerformanceMonitoring,
    optimizeImages,
    debounce,
    throttle,
    optimizeFonts,
    prioritizeResources,
    initPerformanceOptimizations
};