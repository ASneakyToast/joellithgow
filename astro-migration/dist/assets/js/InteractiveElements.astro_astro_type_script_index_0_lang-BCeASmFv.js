var c=Object.defineProperty;var d=(o,e,t)=>e in o?c(o,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):o[e]=t;var n=(o,e,t)=>d(o,typeof e!="symbol"?e+"":e,t);class r{constructor(){this.themes=["default","cyber","ocean","sunset","minimal","neon"],this.currentTheme=this.loadTheme(),this.modal=null,this.init()}init(){this.modal=document.getElementById("themeModal"),this.setupEventListeners(),this.applyTheme(this.currentTheme)}setupEventListeners(){document.querySelectorAll(".theme-option").forEach(t=>{t.addEventListener("click",()=>{const s=t.dataset.theme;this.setTheme(s),this.closeModal()}),t.addEventListener("mouseenter",()=>{t.classList.contains("active")||this.previewTheme(t.dataset.theme)}),t.addEventListener("mouseleave",()=>{t.classList.contains("active")||this.applyTheme(this.currentTheme)})});const e=document.querySelector(".theme-modal-close");e&&e.addEventListener("click",()=>this.closeModal()),this.modal&&this.modal.addEventListener("click",t=>{t.target===this.modal&&this.closeModal()}),document.addEventListener("keydown",t=>{(t.ctrlKey||t.metaKey)&&t.key==="t"&&(t.preventDefault(),this.cycleTheme()),t.key==="Escape"&&this.closeModal()})}openModal(){this.modal&&(this.modal.classList.remove("hidden"),this.updateActiveOption())}closeModal(){this.modal&&(this.modal.classList.add("hidden"),this.applyTheme(this.currentTheme))}setTheme(e){this.currentTheme=e,this.applyTheme(e),this.saveTheme(e),this.updateActiveOption()}previewTheme(e){this.applyTheme(e)}applyTheme(e){document.documentElement.setAttribute("data-theme",e)}cycleTheme(){const t=(this.themes.indexOf(this.currentTheme)+1)%this.themes.length;this.setTheme(this.themes[t])}updateActiveOption(){document.querySelectorAll(".theme-option").forEach(e=>{e.classList.toggle("active",e.dataset.theme===this.currentTheme)})}saveTheme(e){localStorage.setItem("portfolio-theme",e)}loadTheme(){let e=localStorage.getItem("portfolio-theme")||"default";return e==="forest"&&(e="default",localStorage.setItem("portfolio-theme","default")),e}}class h{constructor(){n(this,"modals");n(this,"focusStack");n(this,"keyboardTrap");this.modals=new Map,this.focusStack=[],this.keyboardTrap=null,this.init()}init(){this.registerModals(),this.setupGlobalListeners()}registerModals(){["#caseStudyModal","#themeModal","#keyboard-help-modal"].forEach(t=>{const s=document.querySelector(t);s&&this.modals.set(t,{element:s,isOpen:!1,previousFocus:null,focusableElements:[]})})}setupGlobalListeners(){document.addEventListener("keydown",t=>{t.key==="Escape"&&this.closeTopModal(),t.key==="Tab"&&this.handleTabNavigation(t)});const e=new MutationObserver(t=>{t.forEach(s=>{if(s.type==="attributes"&&s.attributeName==="class"){const i=s.target;this.isModal(i)&&this.handleModalStateChange(i)}})});this.modals.forEach(t=>{e.observe(t.element,{attributes:!0,attributeFilter:["class"]})})}isModal(e){return Array.from(this.modals.values()).some(t=>t.element===e)}handleModalStateChange(e){const t=e.id?`#${e.id}`:this.findModalSelector(e),s=this.modals.get(t);if(!s)return;const i=!e.classList.contains("hidden");i&&!s.isOpen?this.openModal(t):!i&&s.isOpen&&this.closeModal(t)}findModalSelector(e){for(const[t,s]of this.modals)if(s.element===e)return t;return null}openModal(e){const t=this.modals.get(e);t&&(t.previousFocus=document.activeElement,t.isOpen=!0,this.focusStack.push(e),t.focusableElements=this.getFocusableElements(t.element),this.setInitialFocus(t),this.setupFocusTrap(t),this.lockBodyScroll(),this.announceModalOpen(t.element))}closeModal(e){const t=this.modals.get(e);if(!t)return;t.isOpen=!1;const s=this.focusStack.indexOf(e);s>-1&&this.focusStack.splice(s,1),t.previousFocus&&t.previousFocus.isConnected&&t.previousFocus.focus(),this.removeFocusTrap(),this.focusStack.length===0&&this.unlockBodyScroll(),this.announceModalClose()}closeTopModal(){if(this.focusStack.length>0){const e=this.focusStack[this.focusStack.length-1],t=this.modals.get(e);t&&t.element&&t.element.classList.add("hidden")}}getFocusableElements(e){const t=['button:not([disabled]):not([aria-hidden="true"])','[href]:not([disabled]):not([aria-hidden="true"])','input:not([disabled]):not([type="hidden"]):not([aria-hidden="true"])','select:not([disabled]):not([aria-hidden="true"])','textarea:not([disabled]):not([aria-hidden="true"])','[tabindex]:not([tabindex="-1"]):not([disabled]):not([aria-hidden="true"])','[contenteditable]:not([contenteditable="false"])'];return e.querySelectorAll(t.join(","))}setInitialFocus(e){if(e.focusableElements.length>0){const t=e.element.querySelectorAll('button, [role="button"]');(t.length>0?t[0]:e.focusableElements[0]).focus()}else e.element.setAttribute("tabindex","-1"),e.element.focus()}setupFocusTrap(e){if(e.focusableElements.length===0)return;const t=e.focusableElements[0],s=e.focusableElements[e.focusableElements.length-1];this.keyboardTrap=i=>{i.key==="Tab"&&(i.shiftKey?document.activeElement===t&&(i.preventDefault(),s.focus()):document.activeElement===s&&(i.preventDefault(),t.focus()))},e.element.addEventListener("keydown",this.keyboardTrap)}removeFocusTrap(){this.keyboardTrap&&(this.modals.forEach(e=>{e.element.removeEventListener("keydown",this.keyboardTrap)}),this.keyboardTrap=null)}handleTabNavigation(e){const t=document.activeElement;t&&(t.style.visibility==="hidden"||t.style.display==="none"||t.hasAttribute("disabled")||t.getAttribute("aria-hidden")==="true")&&(e.preventDefault(),this.focusNextValidElement(e.shiftKey))}focusNextValidElement(e=!1){const t=document.querySelectorAll('button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]):not([disabled])'),s=Array.from(t).indexOf(document.activeElement);let i;e?i=s<=0?t.length-1:s-1:i=s>=t.length-1?0:s+1,t[i]&&t[i].focus()}lockBodyScroll(){document.body.style.overflow="hidden",document.body.setAttribute("aria-hidden","true")}unlockBodyScroll(){document.body.style.overflow="",document.body.removeAttribute("aria-hidden")}announceModalOpen(e){const t=e.querySelector('h1, h2, h3, [role="heading"]'),s=t?`Modal opened: ${t.textContent}`:"Modal dialog opened";this.announceToScreenReader(s)}announceModalClose(){this.announceToScreenReader("Modal closed")}announceToScreenReader(e){let t=document.getElementById("modal-announcer");t||(t=document.createElement("div"),t.id="modal-announcer",t.className="sr-only",t.setAttribute("aria-live","polite"),t.setAttribute("aria-atomic","true"),document.body.appendChild(t)),t.textContent=e}}class m{constructor(){n(this,"modal");n(this,"content");n(this,"focusManager");this.modal=document.getElementById("caseStudyModal"),this.content=this.modal?.querySelector(".case-study-content"),this.focusManager=null,this.init()}init(){this.setupEventListeners()}setupEventListeners(){const e=document.querySelector(".modal-close");e&&e.addEventListener("click",()=>this.close()),this.modal&&this.modal.addEventListener("click",t=>{t.target===this.modal&&this.close()})}open(e){if(!this.modal||!this.content)return;console.log("Opening case study modal with data:",e);const t=this.generateCaseStudyContent(e);console.log("Generated content:",t),this.content.innerHTML=t,this.modal.classList.remove("hidden"),this.modal.setAttribute("aria-modal","true"),this.modal.setAttribute("role","dialog"),setTimeout(()=>{const s=this.content.querySelector(".case-hero");if(s){const i=window.getComputedStyle(s);console.log("Case hero styles:",{padding:i.padding,background:i.backgroundColor,borderBottom:i.borderBottom})}},100)}close(){this.modal&&(this.modal.classList.add("hidden"),this.modal.removeAttribute("aria-modal"),this.modal.removeAttribute("role"))}generateCaseStudyContent(e){return`
        <div class="case-hero">
            <div class="case-subtitle">${e.subtitle||e.type}</div>
            <h1 class="case-title">${e.title}</h1>
            <p class="case-overview">${e.overview||e.description}</p>
            
            <div class="case-meta">
                <div class="meta-item">
                    <div class="meta-label">duration</div>
                    <div class="meta-value">${e.duration||"Ongoing"}</div>
                </div>
                <div class="meta-item">
                    <div class="meta-label">team</div>
                    <div class="meta-value">${e.team||"Solo project"}</div>
                </div>
                <div class="meta-item">
                    <div class="meta-label">role</div>
                    <div class="meta-value">${e.role||"Designer & Developer"}</div>
                </div>
                <div class="meta-item">
                    <div class="meta-label">tools</div>
                    <div class="meta-value">${e.tools||e.technologies?.join(", ")||""}</div>
                </div>
            </div>
        </div>
        
        <div class="case-section">
            <h2 class="section-title">the challenge</h2>
            <div class="section-content">${e.problem||"Challenge details coming soon..."}</div>
            ${e.insights&&e.insights.length>0?`
                <div class="insight-box">
                    <strong>key insight:</strong> ${e.insights[0]}
                </div>
            `:""}
        </div>
        
        <div class="case-section">
            <h2 class="section-title">the approach</h2>
            <div class="section-content">${e.solution||"Solution details coming soon..."}</div>
            ${e.images&&e.images.length>0?`
                <div class="case-image-gallery">
                    ${e.images[0].type==="video"?`
                        <video class="case-image primary-image" autoplay muted loop playsinline controls>
                            <source src="${e.images[0].src}" type="video/webm">
                            Your browser does not support the video tag.
                        </video>
                    `:`
                        <img src="${e.images[0].src}" alt="${e.images[0].alt}" class="case-image primary-image" loading="lazy">
                    `}
                    <div class="image-caption">${e.images[0].caption}</div>
                </div>
            `:""}
        </div>
        
        ${e.process&&e.process.length>0?`
        <div class="case-section">
            <h2 class="section-title">process deep dive</h2>
            <div class="process-steps">
                ${e.process.map((t,s)=>`
                    <div class="process-step-detailed">
                        <div class="step-number-detailed">${s+1}</div>
                        <div class="step-title-detailed">${t.title}</div>
                        <div class="step-description-detailed">${t.description}</div>
                    </div>
                `).join("")}
            </div>
        </div>
        `:""}
        
        ${e.images&&e.images.length>1?`
            <div class="case-section">
                <h2 class="section-title">visual documentation</h2>
                <div class="image-grid">
                    ${e.images.slice(1).map(t=>`
                        <div class="image-item">
                            <img src="${t.src}" alt="${t.alt}" class="case-image gallery-image" loading="lazy">
                            <div class="image-caption">${t.caption}</div>
                        </div>
                    `).join("")}
                </div>
            </div>
        `:""}
        
        <div class="case-section">
            <h2 class="section-title">key insights</h2>
            ${e.insights&&e.insights.length>0?e.insights.map(t=>`
                <div class="quote-block">
                    "${t}"
                </div>
            `).join(""):"<p>Insights coming soon...</p>"}
        </div>
        
        ${e.id==="homepage-redesign"?`
        <div class="case-section">
            <h2 class="section-title">impact & results</h2>
            <div class="metric-grid">
                ${e.metrics?.map(t=>`
                    <div class="metric-card">
                        <div class="metric-number">${t.number}</div>
                        <div class="metric-label">${t.label}</div>
                    </div>
                `).join("")||""}
            </div>
            <div class="section-content">
                This homepage redesign demonstrated the power of user-centered design thinking, showing how strategic UX improvements can drive measurable business impact while dramatically improving user experience and engagement.
            </div>
        </div>
        `:""}
        
        ${e.id==="ai-powered-portfolio"?`
        <div class="case-section">
            <h2 class="section-title">impact & results</h2>
            <div class="metric-grid">
                ${e.metrics?.map(t=>`
                    <div class="metric-card">
                        <div class="metric-number">${t.number}</div>
                        <div class="metric-label">${t.label}</div>
                    </div>
                `).join("")||""}
            </div>
            <div class="section-content">
                This project demonstrated that AI collaboration isn't just about coding faster—it's about creating space for higher-level creative and strategic decisions while maintaining technical excellence. The portfolio successfully landed the target position, proving that speed doesn't have to compromise quality when AI amplifies human creativity and strategic thinking.
            </div>
        </div>
        `:""}
        
        ${e.liveLink?`
        <div class="case-section">
            <h2 class="section-title">${e.liveLink.title}</h2>
            <div class="live-link-container">
                <a href="${e.liveLink.url}" target="_blank" class="live-link-button">
                    Visit Live Site
                    <span class="link-arrow">→</span>
                </a>
                <p class="live-link-description">${e.liveLink.description}</p>
            </div>
        </div>
        `:""}
        
        ${e.liveLinks?`
        <div class="case-section">
            <h2 class="section-title">${e.liveLinks.title}</h2>
            <div class="live-links-container">
                <p class="live-links-description">${e.liveLinks.description}</p>
                <div class="live-links-grid">
                    ${e.liveLinks.links.map(t=>`
                        <a href="${t.url}" target="_blank" class="live-link-button">
                            ${t.title}
                            <span class="link-arrow">→</span>
                        </a>
                    `).join("")}
                </div>
            </div>
        </div>
        `:""}
      `}}const l=new r;new h;const a=new m;window.themeManager=l;window.caseStudyModal=a;window.openThemeModal=()=>{console.log("openThemeModal called"),l?l.openModal():console.error("ThemeManager not initialized")};window.closeThemeModal=()=>l.closeModal();window.setTheme=o=>l.setTheme(o);window.openCaseStudy=o=>a.open(o);typeof window<"u"&&(window.openThemeModal=()=>{console.log("Global openThemeModal called - checking for theme modal");const o=document.getElementById("themeModal");if(o){console.log("Found theme modal, opening"),o.classList.remove("hidden");const e=document.documentElement.getAttribute("data-theme")||"default";document.querySelectorAll(".theme-option").forEach(t=>{const s=t;s.classList.toggle("active",s.dataset.theme===e)})}else console.error("Theme modal not found")});
