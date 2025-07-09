class ScrollManager {
    constructor() {
        this.savedScrollPosition = 0;
        this.isLocked = false;
    }

    saveScrollPosition() {
        this.savedScrollPosition = window.pageYOffset || document.documentElement.scrollTop;
    }

    getScrollbarWidth() {
        const outer = document.createElement('div');
        outer.style.visibility = 'hidden';
        outer.style.overflow = 'scroll';
        outer.style.msOverflowStyle = 'scrollbar';
        document.body.appendChild(outer);

        const inner = document.createElement('div');
        outer.appendChild(inner);

        const scrollbarWidth = outer.offsetWidth - inner.offsetWidth;
        outer.parentNode.removeChild(outer);

        return scrollbarWidth;
    }

    lockBodyScroll() {
        if (this.isLocked) return;

        this.saveScrollPosition();
        const scrollbarWidth = this.getScrollbarWidth();
        
        document.body.style.position = 'fixed';
        document.body.style.top = `-${this.savedScrollPosition}px`;
        document.body.style.width = '100%';
        document.body.style.paddingRight = `${scrollbarWidth}px`;
        document.body.style.overflow = 'hidden';
        
        this.isLocked = true;
    }

    restoreBodyScroll() {
        if (!this.isLocked) return;

        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.paddingRight = '';
        document.body.style.overflow = '';
        
        // Force instant scroll restoration (ignore smooth scroll CSS)
        const originalScrollBehavior = document.documentElement.style.scrollBehavior;
        document.documentElement.style.scrollBehavior = 'auto';
        window.scrollTo(0, this.savedScrollPosition);
        document.documentElement.style.scrollBehavior = originalScrollBehavior;
        
        this.isLocked = false;
    }

    resetScrollPosition() {
        this.savedScrollPosition = 0;
    }
}

const scrollManager = new ScrollManager();
export default scrollManager;