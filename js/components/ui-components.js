// js/components/ui-components.js

// Component Factory for generating HTML components
class ComponentFactory {
    
    // Project Card Component
    static createProjectCard(project) {
        return `
            <div class="project-card" data-project-id="${project.id}">
                <div class="project-header">
                    <div class="project-number">${project.number}</div>
                    <div class="project-type">${project.type}</div>
                </div>
                <div class="project-content">
                    <h3 class="project-title">${project.title}</h3>
                    <p class="project-description">${project.description}</p>
                    <div class="project-tech">
                        ${project.technologies.map(tech => `<span class="tech-tag">${tech}</span>`).join('')}
                    </div>
                    <div class="project-impact">
                        <div class="impact-metric">→ ${project.impact}</div>
                    </div>
                </div>
            </div>
        `;
    }
    
    // Theme Option Component
    static createThemeOption(theme, isActive = false) {
        const activeClass = isActive ? 'active' : '';
        const colorElements = theme.colors.map(color => 
            `<div class="theme-color" style="background: ${color}"></div>`
        ).join('');
        
        return `
            <div class="theme-option ${activeClass}" data-theme="${theme.name}" onclick="setTheme('${theme.name}')">
                <div class="theme-name">${theme.displayName}</div>
                <div class="theme-palette">
                    ${colorElements}
                </div>
                <div class="theme-description">${theme.description}</div>
            </div>
        `;
    }
    
    // Stat Item Component
    static createStatItem(stat) {
        return `
            <div class="stat-item">
                <div class="stat-number">${stat.number}</div>
                <div class="stat-label">${stat.label}</div>
            </div>
        `;
    }
    
    // Skill Category Component
    static createSkillCategory(categoryName, skills) {
        const skillItems = skills.map(skill => `<span class="skill-item">${skill}</span>`).join('');
        
        return `
            <div class="skill-category">
                <div class="skill-title">${categoryName}</div>
                <div class="skill-list">
                    ${skillItems}
                </div>
            </div>
        `;
    }
    
    // Process Navigation Item Component
    static createProcessNavItem(step) {
        return `
            <div class="process-nav-item" data-step="${step.id}">
                <div class="nav-step-icon">
                    ${this.getStepIcon(step.icon)}
                </div>
                <div class="nav-step-title">${step.title}</div>
            </div>
        `;
    }
    
    // Process Step Content Component
    static createProcessStepContent(step) {
        return `
            <div class="process-step-content" id="step-${step.id}">
                <div class="step-content-header">
                    <div class="step-content-title">${step.title}</div>
                    <div class="step-content-description">${step.description}</div>
                </div>
                <div class="step-content-example">
                    <h4>${step.example.title}</h4>
                    <p>${step.example.content}</p>
                </div>
            </div>
        `;
    }
    
    // Contact Method Component
    static createContactMethod(method) {
        return `
            <a href="${method.href}" class="contact-method">
                <div class="contact-label">${method.label}</div>
                <div class="contact-text">${method.value}</div>
            </a>
        `;
    }
    
    // Navigation Item Component
    static createNavigationItem(navItem) {
        return `<a href="${navItem.href}" class="nav-link">${navItem.label}</a>`;
    }
    
    // Floating Element Component
    static createFloatingElement(text, index) {
        return `
            <div class="floating-element floating-element-${index + 1}">
                ${text}
            </div>
        `;
    }
    
    // Helper method to get SVG icons for process steps
    static getStepIcon(iconType) {
        const icons = {
            research: `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="11" cy="11" r="8"></circle>
                    <path d="m21 21-4.35-4.35"></path>
                </svg>
            `,
            prototype: `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                    <line x1="8" y1="21" x2="16" y2="21"></line>
                    <line x1="12" y1="17" x2="12" y2="21"></line>
                </svg>
            `,
            collaboration: `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
            `,
            implementation: `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="16 18 22 12 16 6"></polyline>
                    <polyline points="8 6 2 12 8 18"></polyline>
                </svg>
            `
        };
        
        return icons[iconType] || icons.research;
    }
    
    // Generate complete sections
    static generateProjectsSection(projects) {
        const projectCards = projects.map(project => this.createProjectCard(project)).join('');
        return `
            <div class="projects-container">
                ${projectCards}
            </div>
        `;
    }
    
    static generateThemeModal(themes, currentTheme) {
        const themeOptions = themes.map(theme => 
            this.createThemeOption(theme, theme.name === currentTheme)
        ).join('');
        
        return `
            <div class="theme-modal-overlay" id="themeModal">
                <div class="theme-modal">
                    <div class="theme-modal-header">
                        <div class="theme-modal-title">Choose Your Theme</div>
                        <button class="theme-modal-close" onclick="closeThemeModal()">×</button>
                    </div>
                    <div class="theme-selector">
                        ${themeOptions}
                    </div>
                    <div class="theme-modal-footer">
                        <div class="theme-modal-hint">Press Ctrl+T to cycle themes</div>
                    </div>
                </div>
            </div>
        `;
    }
    
    static generateAboutSection(aboutData) {
        const stats = aboutData.statistics.map(stat => this.createStatItem(stat)).join('');
        const skillCategories = Object.entries(aboutData.skills)
            .map(([category, skills]) => this.createSkillCategory(category, skills))
            .join('');
        
        return `
            <div class="about-content">
                <h2 class="section-title">${aboutData.title}</h2>
                <div class="about-intro">
                    <div class="about-text">${aboutData.biography}</div>
                    <div class="about-stats">
                        ${stats}
                    </div>
                </div>
                <div class="skills-grid">
                    ${skillCategories}
                </div>
            </div>
        `;
    }
    
    static generateProcessSection(processData) {
        const navItems = processData.steps.map(step => this.createProcessNavItem(step)).join('');
        const stepContents = processData.steps.map(step => this.createProcessStepContent(step)).join('');
        
        return `
            <div class="process-content">
                <div class="process-header">
                    <h2 class="section-title">${processData.title}</h2>
                    <p class="process-description">${processData.description}</p>
                </div>
                <div class="process-nav">
                    ${navItems}
                </div>
                <div class="process-steps">
                    ${stepContents}
                </div>
            </div>
        `;
    }
    
    static generateContactSection(contactData) {
        const contactMethods = contactData.methods.map(method => this.createContactMethod(method)).join('');
        
        return `
            <div class="contact-content">
                <h2 class="section-title">${contactData.title}</h2>
                <p class="contact-description">${contactData.description}</p>
                <div class="contact-methods">
                    ${contactMethods}
                </div>
            </div>
        `;
    }
    
    static generateNavigation(navigationData) {
        const navItems = navigationData.map(item => this.createNavigationItem(item)).join('');
        
        return `
            <nav class="nav">
                ${navItems}
            </nav>
        `;
    }
    
    static generateHeroFloatingElements(floatingElements) {
        return floatingElements.map((element, index) => 
            this.createFloatingElement(element, index)
        ).join('');
    }
}

// Template strings for complete sections
const templates = {
    projectCard: ComponentFactory.createProjectCard,
    themeOption: ComponentFactory.createThemeOption,
    statItem: ComponentFactory.createStatItem,
    skillCategory: ComponentFactory.createSkillCategory,
    processNavItem: ComponentFactory.createProcessNavItem,
    processStepContent: ComponentFactory.createProcessStepContent,
    contactMethod: ComponentFactory.createContactMethod,
    navigationItem: ComponentFactory.createNavigationItem,
    floatingElement: ComponentFactory.createFloatingElement
};

export { ComponentFactory, templates };
export default ComponentFactory;