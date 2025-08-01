// js/components/project-cards.js
// Project Cards Module - Handles project data, case study modals, and project interactions

import projects from '../data/projects.js';
import scrollManager from '../utils/scroll-manager.js';

// Case Study Modal Functions
function openCaseStudy(data) {
    const modal = document.getElementById('caseStudyModal');
    if (!modal) {
        console.error('Case study modal not found');
        return;
    }
    
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    const modalContent = modal.querySelector('.modal-content');
    
    if (modalTitle) modalTitle.textContent = data.title;
    if (modalBody) {
        modalBody.innerHTML = generateCaseStudyContent(data);
        // Reset scroll position of the actual scrollable container
        if (modalContent) modalContent.scrollTop = 0;
    }
    
    modal.classList.add('show');
    scrollManager.lockBodyScroll();
}

function closeModal() {
    const modal = document.getElementById('caseStudyModal');
    if (modal) {
        modal.classList.remove('show');
        scrollManager.restoreBodyScroll();
    }
}

function getProjectData(id) {
    if (typeof id === 'number') {
        return projects[id] || projects[0];
    }
    return projects.find(project => project.id === id) || projects[0];
}

function generateCaseStudyContent(data) {
    return `
        <div class="case-hero">
            <div class="case-subtitle">${data.subtitle}</div>
            <h1 class="case-title">${data.title}</h1>
            <p class="case-overview">${data.overview}</p>
            
            <div class="case-meta">
                <div class="meta-item">
                    <div class="meta-label">duration</div>
                    <div class="meta-value">${data.duration}</div>
                </div>
                <div class="meta-item">
                    <div class="meta-label">team</div>
                    <div class="meta-value">${data.team}</div>
                </div>
                <div class="meta-item">
                    <div class="meta-label">role</div>
                    <div class="meta-value">${data.role}</div>
                </div>
                <div class="meta-item">
                    <div class="meta-label">tools</div>
                    <div class="meta-value">${data.tools}</div>
                </div>
            </div>
        </div>
        
        <div class="case-section">
            <h2 class="section-title">the challenge</h2>
            <div class="section-content">${data.problem}</div>
            <div class="insight-box">
                <strong>key insight:</strong> ${data.insights[0]}
            </div>
        </div>
        
        <div class="case-section">
            <h2 class="section-title">the approach</h2>
            <div class="section-content">${data.solution}</div>
            ${data.images && data.images.length > 0 ? `
                <div class="case-image-gallery">
                    ${data.images[0].type === 'video' ? `
                        <video class="case-image primary-image" autoplay muted loop playsinline controls>
                            <source src="${data.images[0].src}" type="video/webm">
                            Your browser does not support the video tag.
                        </video>
                    ` : `
                        <img src="${data.images[0].src}" alt="${data.images[0].alt}" class="case-image primary-image" loading="lazy">
                    `}
                    <div class="image-caption">${data.images[0].caption}</div>
                </div>
            ` : ''}
        </div>
        
        ${data.process && data.process.length > 0 ? `
        <div class="case-section">
            <h2 class="section-title">process deep dive</h2>
            <div class="process-steps">
                ${data.process.map((step, index) => `
                    <div class="process-step-detailed">
                        <div class="step-number-detailed">${index + 1}</div>
                        <div class="step-title-detailed">${step.title}</div>
                        <div class="step-description-detailed">${step.description}</div>
                    </div>
                `).join('')}
            </div>
        </div>
        ` : ''}
        
        ${data.images && data.images.length > 1 ? `
            <div class="case-section">
                <h2 class="section-title">visual documentation</h2>
                <div class="image-grid">
                    ${data.images.slice(1).map(image => `
                        <div class="image-item">
                            <img src="${image.src}" alt="${image.alt}" class="case-image gallery-image" loading="lazy">
                            <div class="image-caption">${image.caption}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        ` : ''}
        
        <div class="case-section">
            <h2 class="section-title">key insights</h2>
            ${data.insights.map(insight => `
                <div class="quote-block">
                    "${insight}"
                </div>
            `).join('')}
        </div>
        
        <!-- <div class="case-section">
            <h2 class="section-title">impact & results</h2>
            <div class="metric-grid">
                ${data.metrics.map(metric => `
                    <div class="metric-card">
                        <div class="metric-number">${metric.number}</div>
                        <div class="metric-label">${metric.label}</div>
                    </div>
                `).join('')}
            </div>
            <div class="section-content">
                This project demonstrated the power of ${data.subtitle.toLowerCase()} thinking, showing how creative technology solutions can drive measurable business impact while improving user experience.
            </div>
        </div> -->
        
        ${data.id === 'homepage-redesign' ? `
        <div class="case-section">
            <h2 class="section-title">impact & results</h2>
            <div class="metric-grid">
                ${data.metrics.map(metric => `
                    <div class="metric-card">
                        <div class="metric-number">${metric.number}</div>
                        <div class="metric-label">${metric.label}</div>
                    </div>
                `).join('')}
            </div>
            <div class="section-content">
                This homepage redesign demonstrated the power of user-centered design thinking, showing how strategic UX improvements can drive measurable business impact while dramatically improving user experience and engagement.
            </div>
        </div>
        ` : ''}
        
        ${data.id === 'ai-powered-portfolio' ? `
        <div class="case-section">
            <h2 class="section-title">impact & results</h2>
            <div class="metric-grid">
                ${data.metrics.map(metric => `
                    <div class="metric-card">
                        <div class="metric-number">${metric.number}</div>
                        <div class="metric-label">${metric.label}</div>
                    </div>
                `).join('')}
            </div>
            <div class="section-content">
                This project demonstrated that AI collaboration isn't just about coding faster—it's about creating space for higher-level creative and strategic decisions while maintaining technical excellence. The portfolio successfully landed the target position, proving that speed doesn't have to compromise quality when AI amplifies human creativity and strategic thinking.
            </div>
        </div>
        ` : ''}
        
        ${data.liveLink ? `
        <div class="case-section">
            <h2 class="section-title">${data.liveLink.title}</h2>
            <div class="live-link-container">
                <a href="${data.liveLink.url}" target="_blank" class="live-link-button">
                    Visit Live Site
                    <span class="link-arrow">→</span>
                </a>
                <p class="live-link-description">${data.liveLink.description}</p>
            </div>
        </div>
        ` : ''}
        
        ${data.liveLinks ? `
        <div class="case-section">
            <h2 class="section-title">${data.liveLinks.title}</h2>
            <div class="live-links-container">
                <p class="live-links-description">${data.liveLinks.description}</p>
                <div class="live-links-grid">
                    ${data.liveLinks.links.map(link => `
                        <a href="${link.url}" target="_blank" class="live-link-button">
                            ${link.title}
                            <span class="link-arrow">→</span>
                        </a>
                    `).join('')}
                </div>
            </div>
        </div>
        ` : ''}
    `;
}

// Initialize project card interactions
function initProjectCards() {
    const projectCards = document.querySelectorAll('.project-card');
    
    projectCards.forEach((card, index) => {
        // Add click handler
        card.addEventListener('click', function() {
            const projectId = this.getAttribute('data-project-id');
            const projectData = getProjectData(projectId);
            openCaseStudy(projectData);
        });
        
        // Add hover effects
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.03) rotate(1deg)';
        });
        
        card.addEventListener('mouseleave', function() {
            const isOdd = index % 2 === 0;
            this.style.transform = isOdd ? 'rotate(0.5deg)' : 'rotate(-0.5deg)';
        });
    });
}

// Render project cards dynamically
function renderProjectCards(container) {
    if (!container) return;
    
    const projectsHTML = projects.map(project => `
        <div class="project-card" data-project-id="${project.id}">
            <div class="project-header">
                <div class="project-number">${project.number}</div>
                <div class="project-type">${project.type}</div>
            </div>
            ${project.images && project.images.length > 0 ? `
                <div class="project-image-preview ${project.images[0].type === 'video' ? 'video-container' : ''}">
                    ${project.images[0].type === 'video' ? `
                        <video class="project-preview-image" autoplay muted loop playsinline>
                            <source src="${project.images[0].src}" type="video/webm">
                            Your browser does not support the video tag.
                        </video>
                    ` : `
                        <img src="${project.images[0].src}" alt="${project.images[0].alt}" class="project-preview-image" loading="lazy">
                    `}
                </div>
            ` : ''}
            <div class="project-content">
                <h3 class="project-title">${project.title}</h3>
                <p class="project-description">${project.description}</p>
                <div class="project-tech">
                    ${project.technologies.map(tech => `<span class="tech-tag">${tech}</span>`).join('')}
                </div>
            </div>
        </div>
    `).join('');
    
    container.innerHTML = projectsHTML;
    
    // Initialize interactions after rendering
    initProjectCards();
}

// Initialize case study modal
function initCaseStudyModal() {
    // Create modal HTML if it doesn't exist
    let modal = document.getElementById('caseStudyModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'caseStudyModal';
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2 class="modal-title" id="modalTitle">Case Study</h2>
                    <button class="modal-close" onclick="closeModal()">×</button>
                </div>
                <div class="modal-body" id="modalBody">
                    <!-- Case study content will be inserted here -->
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }
    
    // Add event listeners
    modal.addEventListener('click', function(e) {
        if (e.target === this) {
            closeModal();
        }
    });
    
    const closeButton = modal.querySelector('.modal-close');
    if (closeButton) {
        closeButton.addEventListener('click', closeModal);
    }
}

// Get all projects
function getAllProjects() {
    return projects;
}

// Get project by ID
function getProjectById(id) {
    return projects.find(project => project.id === id);
}

// Filter projects by type
function filterProjectsByType(type) {
    return projects.filter(project => project.type === type);
}

// Search projects
function searchProjects(query) {
    const searchTerm = query.toLowerCase();
    return projects.filter(project => 
        project.title.toLowerCase().includes(searchTerm) ||
        project.description.toLowerCase().includes(searchTerm) ||
        project.technologies.some(tech => tech.toLowerCase().includes(searchTerm))
    );
}

// Export functions for use in other modules
export {
    openCaseStudy,
    closeModal,
    getProjectData,
    generateCaseStudyContent,
    initProjectCards,
    renderProjectCards,
    initCaseStudyModal,
    getAllProjects,
    getProjectById,
    filterProjectsByType,
    searchProjects
};