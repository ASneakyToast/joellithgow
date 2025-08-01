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

// Scroll spy for main navigation
function initScrollSpy() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    
    if (sections.length === 0 || navLinks.length === 0) return;
    
    const observerOptions = {
        threshold: [0.1, 0.25, 0.5],
        rootMargin: '-10% 0px -40% 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const sectionId = entry.target.id;
                updateActiveNavigation(`#${sectionId}`);
            }
        });
    }, observerOptions);
    
    // Observe all sections
    sections.forEach(section => {
        observer.observe(section);
    });
    
    // Handle scroll to top case (no active section)
    window.addEventListener('scroll', () => {
        if (window.scrollY < 200) {
            navLinks.forEach(link => link.classList.remove('active'));
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
    const floatingElements = document.querySelectorAll('.floating-element, .contact-floating-element');
    
    floatingElements.forEach(element => {
        let isDragging = false;
        let startX = 0;
        let startY = 0;
        let currentX = 0;
        let currentY = 0;
        let initialTransform = '';
        
        // Store initial transform to preserve rotation
        initialTransform = window.getComputedStyle(element).transform;
        
        function handleStart(e) {
            isDragging = true;
            element.classList.add('dragging');
            
            const clientX = e.clientX || (e.touches && e.touches[0].clientX);
            const clientY = e.clientY || (e.touches && e.touches[0].clientY);
            
            // Get current position more accurately
            const rect = element.getBoundingClientRect();
            
            // Calculate offset from mouse to element's top-left corner
            startX = clientX - rect.left;
            startY = clientY - rect.top;
            
            // Store the current computed transform to preserve rotation
            const computedStyle = window.getComputedStyle(element);
            const currentTransform = computedStyle.transform;
            
            // Convert element to fixed positioning to avoid parent container issues
            currentX = rect.left;
            currentY = rect.top;
            
            element.style.position = 'fixed';
            element.style.left = currentX + 'px';
            element.style.top = currentY + 'px';
            element.style.right = 'auto';
            element.style.bottom = 'auto';
            element.style.margin = '0';
            element.style.transform = currentTransform; // Preserve rotation
            element.style.zIndex = '1000'; // Bring to front while dragging
            
            // Prevent text selection and default behaviors
            e.preventDefault();
            e.stopPropagation();
        }
        
        function handleMove(e) {
            if (!isDragging) return;
            
            e.preventDefault();
            
            const clientX = e.clientX || (e.touches && e.touches[0].clientX);
            const clientY = e.clientY || (e.touches && e.touches[0].clientY);
            
            // Calculate new position
            const newX = clientX - startX;
            const newY = clientY - startY;
            
            // Constrain to viewport with padding
            const padding = 10;
            const maxX = window.innerWidth - element.offsetWidth - padding;
            const maxY = window.innerHeight - element.offsetHeight - padding;
            
            currentX = Math.max(padding, Math.min(newX, maxX));
            currentY = Math.max(padding, Math.min(newY, maxY));
            
            // Apply position with transform preserved
            element.style.left = currentX + 'px';
            element.style.top = currentY + 'px';
        }
        
        function handleEnd() {
            if (!isDragging) return;
            
            isDragging = false;
            element.classList.remove('dragging');
            
            // Convert back to absolute positioning within parent container
            const parentRect = element.parentElement.getBoundingClientRect();
            const elementRect = element.getBoundingClientRect();
            
            // Calculate position relative to parent
            const relativeX = elementRect.left - parentRect.left;
            const relativeY = elementRect.top - parentRect.top;
            
            // Convert to absolute positioning within parent
            element.style.position = 'absolute';
            element.style.left = relativeX + 'px';
            element.style.top = relativeY + 'px';
            element.style.right = 'auto';
            element.style.bottom = 'auto';
            element.style.zIndex = '10'; // Reset to normal z-index
        }
        
        // Mouse events
        element.addEventListener('mousedown', handleStart, { passive: false });
        document.addEventListener('mousemove', handleMove, { passive: false });
        document.addEventListener('mouseup', handleEnd);
        
        // Touch events  
        element.addEventListener('touchstart', handleStart, { passive: false });
        document.addEventListener('touchmove', handleMove, { passive: false });
        document.addEventListener('touchend', handleEnd);
        
        // Prevent context menu on long press
        element.addEventListener('contextmenu', e => e.preventDefault());
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

// Snake Easter Egg - Slithering Infinity Symbol
function initSnakeEasterEgg() {
    const infinitySymbol = document.querySelector('.stat-number.infinity');
    
    if (!infinitySymbol) return;
    
    let clickCount = 0;
    let clickTimer = null;
    
    // Add click handler for navigation to Snake game
    infinitySymbol.addEventListener('click', function(e) {
        e.preventDefault();
        
        clickCount++;
        
        // Clear existing timer
        if (clickTimer) {
            clearTimeout(clickTimer);
        }
        
        // Single click - navigate to Snake game with subtle animation
        if (clickCount === 1) {
            clickTimer = setTimeout(() => {
                // Add extra slither animation before navigation
                this.style.animation = 'slither 0.5s ease-in-out 2';
                
                // Navigate after animation
                setTimeout(() => {
                    window.location.href = '/snake.html';
                }, 1000);
                
                clickCount = 0;
            }, 300);
        }
        
        // Double click - immediate navigation with special effect
        if (clickCount === 2) {
            clearTimeout(clickTimer);
            
            // Special double-click effect
            this.style.animation = 'slither 0.2s ease-in-out 3';
            this.style.transform = 'scale(1.3)';
            
            // Navigate immediately with snake-like transition
            setTimeout(() => {
                // Add screen flash effect like eating food in snake
                const flash = document.createElement('div');
                flash.style.cssText = `
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100vw;
                    height: 100vh;
                    background: var(--accent-secondary);
                    opacity: 0.7;
                    z-index: 9999;
                    pointer-events: none;
                    animation: flash 0.3s ease-out;
                `;
                
                // Add flash animation keyframes
                if (!document.querySelector('#snake-flash-style')) {
                    const style = document.createElement('style');
                    style.id = 'snake-flash-style';
                    style.textContent = `
                        @keyframes flash {
                            0% { opacity: 0; }
                            50% { opacity: 0.7; }
                            100% { opacity: 0; }
                        }
                    `;
                    document.head.appendChild(style);
                }
                
                document.body.appendChild(flash);
                
                // Navigate after flash
                setTimeout(() => {
                    window.location.href = '/snake';
                }, 300);
                
                // Clean up flash element
                setTimeout(() => {
                    if (flash.parentNode) {
                        flash.parentNode.removeChild(flash);
                    }
                }, 350);
                
            }, 400);
            
            clickCount = 0;
        }
    });
    
    // Add subtle hint on long hover (3+ seconds)
    let hoverTimer = null;
    
    infinitySymbol.addEventListener('mouseenter', function() {
        hoverTimer = setTimeout(() => {
            // Add subtle pulsing to hint it's clickable
            this.style.animation = 'slither 1s ease-in-out 1, glow-pulse 2s ease-in-out infinite';
            
            // Add small tooltip hint
            const hint = document.createElement('div');
            hint.className = 'snake-hint';
            hint.textContent = '🐍 Click me!';
            hint.style.cssText = `
                position: absolute;
                top: -40px;
                left: 50%;
                transform: translateX(-50%);
                background: var(--bg-secondary);
                color: var(--accent-secondary);
                padding: 5px 10px;
                border-radius: 15px;
                font-size: 12px;
                white-space: nowrap;
                z-index: 1000;
                animation: fadeInOut 2s ease-in-out;
                pointer-events: none;
                border: 1px solid var(--accent-secondary);
            `;
            
            // Add hint animation
            if (!document.querySelector('#snake-hint-style')) {
                const style = document.createElement('style');
                style.id = 'snake-hint-style';
                style.textContent = `
                    @keyframes fadeInOut {
                        0% { opacity: 0; transform: translateX(-50%) translateY(10px); }
                        20% { opacity: 1; transform: translateX(-50%) translateY(0px); }
                        80% { opacity: 1; transform: translateX(-50%) translateY(0px); }
                        100% { opacity: 0; transform: translateX(-50%) translateY(-10px); }
                    }
                `;
                document.head.appendChild(style);
            }
            
            this.appendChild(hint);
            
            // Remove hint after animation
            setTimeout(() => {
                if (hint.parentNode) {
                    hint.parentNode.removeChild(hint);
                }
            }, 2000);
            
        }, 3000);
    });
    
    infinitySymbol.addEventListener('mouseleave', function() {
        if (hoverTimer) {
            clearTimeout(hoverTimer);
        }
        // Reset animation to normal hover state  
        this.style.animation = '';
    });
}

// Initialize all UI interactions
function initAllUIInteractions() {
    initSmoothScrolling();
    initScrollSpy();
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
    initSnakeEasterEgg();
}

// Export functions for use in other modules
export {
    initSmoothScrolling,
    updateActiveNavigation,
    initScrollSpy,
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
    initSnakeEasterEgg,
    initAllUIInteractions
};
