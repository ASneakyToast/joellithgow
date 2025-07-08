// js/components/ui-interactions.js
// UI Interactions Module - Handles animations, smooth scrolling, and interactive effects

// Smooth scrolling for navigation links
function initSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                
                // Update active navigation state
                updateActiveNavigation(this.getAttribute('href'));
            }
        });
    });
}

// Update active navigation state
function updateActiveNavigation(href) {
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === href) {
            link.classList.add('active');
        }
    });
}

// Parallax effect for floating elements
function initParallaxEffects() {
    let ticking = false;
    
    function updateParallax() {
        const scrolled = window.pageYOffset;
        const parallaxElements = document.querySelectorAll('.floating-element');
        
        parallaxElements.forEach((element, index) => {
            const speed = 0.3 * (index + 1);
            const rotation = 12 + (index * 3);
            element.style.transform = `translateY(${scrolled * speed}px) rotate(${rotation}deg)`;
        });
        
        ticking = false;
    }
    
    function requestTick() {
        if (!ticking) {
            requestAnimationFrame(updateParallax);
            ticking = true;
        }
    }
    
    window.addEventListener('scroll', requestTick);
}

// Process section scroll interactions
function initProcessSection() {
    const processNavItems = document.querySelectorAll('.process-nav-item');
    const processSteps = document.querySelectorAll('.process-step-content');
    
    if (processNavItems.length === 0 || processSteps.length === 0) return;
    
    // Click handlers for nav items
    processNavItems.forEach(item => {
        item.addEventListener('click', function() {
            const targetStep = this.dataset.step;
            const targetElement = document.getElementById(`step-${targetStep}`);
            
            if (targetElement) {
                // Smooth scroll to target
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                
                // Update active states
                updateActiveStep(targetStep);
            }
        });
    });
    
    // Intersection Observer for scroll-based highlighting
    const observerOptions = {
        threshold: 0.5,
        rootMargin: '-20% 0px -20% 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const stepNumber = entry.target.id.split('-')[1];
                updateActiveStep(stepNumber);
            }
        });
    }, observerOptions);
    
    // Observe all process steps
    processSteps.forEach(step => {
        observer.observe(step);
    });
}

function updateActiveStep(stepNumber) {
    // Update navigation active state
    document.querySelectorAll('.process-nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    const activeNavItem = document.querySelector(`[data-step="${stepNumber}"]`);
    if (activeNavItem) {
        activeNavItem.classList.add('active');
    }
    
    // Update content active state
    document.querySelectorAll('.process-step-content').forEach(content => {
        content.classList.remove('active');
    });
    
    const activeContent = document.getElementById(`step-${stepNumber}`);
    if (activeContent) {
        activeContent.classList.add('active');
    }
}

// Theme option hover effects
function initThemeOptionHovers() {
    const themeOptions = document.querySelectorAll('.theme-option');
    
    themeOptions.forEach(option => {
        option.addEventListener('mouseenter', () => {
            if (!option.classList.contains('active')) {
                // Import theme manager functions dynamically
                import('./theme-manager.js').then(module => {
                    module.previewTheme(option.dataset.theme);
                });
            }
        });
        
        option.addEventListener('mouseleave', () => {
            if (!option.classList.contains('active')) {
                // Import theme manager functions dynamically
                import('./theme-manager.js').then(module => {
                    module.clearThemePreview();
                });
            }
        });
        
        // Auto-close modal when theme is selected
        option.addEventListener('click', () => {
            setTimeout(() => {
                import('./theme-manager.js').then(module => {
                    module.closeThemeModal();
                });
            }, 300);
        });
    });
}

// Cursor trail animation
function initCursorTrail() {
    let trails = [];
    const maxTrails = 5;
    
    function createTrail(x, y) {
        const trail = document.createElement('div');
        trail.className = 'cursor-trail';
        trail.style.cssText = `
            position: fixed;
            width: 6px;
            height: 6px;
            background: var(--accent-primary);
            border-radius: 50%;
            pointer-events: none;
            z-index: 9999;
            left: ${x - 3}px;
            top: ${y - 3}px;
            opacity: 0.8;
            transition: opacity 0.3s ease, transform 0.3s ease;
        `;
        
        document.body.appendChild(trail);
        trails.push(trail);
        
        // Remove excess trails
        if (trails.length > maxTrails) {
            const oldTrail = trails.shift();
            if (oldTrail && oldTrail.parentNode) {
                oldTrail.parentNode.removeChild(oldTrail);
            }
        }
        
        // Animate trail
        setTimeout(() => {
            trail.style.opacity = '0';
            trail.style.transform = 'scale(0)';
        }, 50);
        
        setTimeout(() => {
            if (trail.parentNode) {
                trail.parentNode.removeChild(trail);
            }
        }, 350);
    }
    
    let lastTime = 0;
    document.addEventListener('mousemove', (e) => {
        const now = Date.now();
        if (now - lastTime > 50) { // Throttle to every 50ms
            createTrail(e.clientX, e.clientY);
            lastTime = now;
        }
    });
}

// Draggable functionality for floating elements
function makeDraggable() {
    const floatingElements = document.querySelectorAll('.floating-element');
    
    floatingElements.forEach(element => {
        let isDragging = false;
        let startX = 0;
        let startY = 0;
        
        function handleStart(e) {
            isDragging = true;
            element.classList.add('dragging');
            
            const clientX = e.clientX || (e.touches && e.touches[0].clientX);
            const clientY = e.clientY || (e.touches && e.touches[0].clientY);
            
            const rect = element.getBoundingClientRect();
            startX = clientX - rect.left;
            startY = clientY - rect.top;
            
            // Prevent text selection
            e.preventDefault();
        }
        
        function handleMove(e) {
            if (!isDragging) return;
            
            const clientX = e.clientX || (e.touches && e.touches[0].clientX);
            const clientY = e.clientY || (e.touches && e.touches[0].clientY);
            
            const newX = clientX - startX;
            const newY = clientY - startY;
            
            // Constrain to viewport
            const maxX = window.innerWidth - element.offsetWidth;
            const maxY = window.innerHeight - element.offsetHeight;
            
            element.style.left = Math.max(0, Math.min(newX, maxX)) + 'px';
            element.style.top = Math.max(0, Math.min(newY, maxY)) + 'px';
            element.style.right = 'auto';
            element.style.bottom = 'auto';
        }
        
        function handleEnd() {
            if (!isDragging) return;
            
            isDragging = false;
            element.classList.remove('dragging');
        }
        
        // Mouse events
        element.addEventListener('mousedown', handleStart);
        document.addEventListener('mousemove', handleMove);
        document.addEventListener('mouseup', handleEnd);
        
        // Touch events
        element.addEventListener('touchstart', handleStart);
        document.addEventListener('touchmove', handleMove);
        document.addEventListener('touchend', handleEnd);
    });
}

// Animation delays for floating elements
function initFloatingElementDelays() {
    document.querySelectorAll('.floating-element').forEach((el, index) => {
        el.style.animationDelay = `${index * 0.8}s`;
    });
}

// Initialize scroll-based animations
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
            }
        });
    }, observerOptions);
    
    // Observe elements that should animate on scroll
    document.querySelectorAll('.animate-on-scroll').forEach(el => {
        observer.observe(el);
    });
}

// Initialize contact method interactions
function initContactMethodInteractions() {
    document.querySelectorAll('.contact-method').forEach(method => {
        method.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.05) rotate(0deg)';
        });
        
        method.addEventListener('mouseleave', function() {
            const transform = this.style.transform;
            const currentRotation = transform.match(/rotate\(([^)]+)\)/);
            const rotation = currentRotation ? currentRotation[1] : '1deg';
            this.style.transform = `rotate(${rotation})`;
        });
    });
}

// Initialize skill item interactions
function initSkillItemInteractions() {
    document.querySelectorAll('.skill-item').forEach(item => {
        item.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.1)';
            this.style.background = 'var(--accent-primary)';
            this.style.color = 'var(--text-light)';
        });
        
        item.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
            this.style.background = '';
            this.style.color = '';
        });
    });
}

// Initialize tech tag interactions
function initTechTagInteractions() {
    document.querySelectorAll('.tech-tag').forEach(tag => {
        tag.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.1)';
            this.style.background = 'var(--accent-secondary)';
            this.style.color = 'var(--text-light)';
        });
        
        tag.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
            this.style.background = '';
            this.style.color = '';
        });
    });
}

// Initialize all UI interactions
function initAllUIInteractions() {
    initSmoothScrolling();
    initParallaxEffects();
    initProcessSection();
    initThemeOptionHovers();
    initCursorTrail();
    makeDraggable();
    initFloatingElementDelays();
    initScrollAnimations();
    initContactMethodInteractions();
    initSkillItemInteractions();
    initTechTagInteractions();
}

// Export functions for use in other modules
export {
    initSmoothScrolling,
    updateActiveNavigation,
    initParallaxEffects,
    initProcessSection,
    updateActiveStep,
    initThemeOptionHovers,
    initCursorTrail,
    makeDraggable,
    initFloatingElementDelays,
    initScrollAnimations,
    initContactMethodInteractions,
    initSkillItemInteractions,
    initTechTagInteractions,
    initAllUIInteractions
};