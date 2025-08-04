import { c as createAstro, a as createComponent, d as renderTemplate, i as renderSlot, j as renderHead, e as addAttribute } from "./astro/server-CBzQw8Wf.js";
import "kleur/colors";
import "clsx";
/* empty css                        */
var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(cooked.slice()) }));
var _a;
const $$Astro = createAstro("https://joellithgow.com");
const $$BaseLayout = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$BaseLayout;
  const {
    title = "Joel Lithgow - Creative Technologist",
    description = "I transform complex ideas into intuitive digital experiences through design thinking and technical expertise.",
    canonicalURL = Astro2.url.href,
    image = "/assets/og-image.jpg",
    robots = "index, follow",
    themeColor = "#ff6b6b"
  } = Astro2.props;
  return renderTemplate(_a || (_a = __template(['<html lang="en" data-astro-cid-37fxchfa> <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><meta name="description"', '><meta name="keywords" content="creative technologist, UX designer, frontend developer, AI-augmented development, rapid prototyping"><meta name="author" content="Joel Lithgow"><meta name="theme-color"', '><meta name="robots"', '><!-- Canonical URL --><link rel="canonical"', '><!-- Open Graph / Facebook --><meta property="og:type" content="website"><meta property="og:url"', '><meta property="og:title"', '><meta property="og:description"', '><meta property="og:image"', '><!-- Twitter --><meta property="twitter:card" content="summary_large_image"><meta property="twitter:url"', '><meta property="twitter:title"', '><meta property="twitter:description"', '><meta property="twitter:image"', '><!-- Structured Data --><script type="application/ld+json">\n  {\n    "@context": "https://schema.org",\n    "@type": "Person",\n    "name": "Joel Lithgow",\n    "jobTitle": "Creative Technologist",\n    "description": "I transform complex ideas into intuitive digital experiences through design thinking and technical expertise.",\n    "url": "https://joellithgow.com",\n    "sameAs": [\n      "https://linkedin.com/in/joellithgow",\n      "https://github.com/joellithgow"\n    ]\n  }\n  <\/script><title>', `</title><!-- Early theme system initialization to ensure functions are available for onclick handlers --><script>
    // Global theme functions - available immediately for onclick handlers
    window.openThemeModal = function() {
      console.log('Early openThemeModal called');
      const modal = document.getElementById('themeModal');
      if (modal) {
        console.log('Opening theme modal');
        modal.classList.remove('hidden');
        // Update active theme option
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'default';
        document.querySelectorAll('.theme-option').forEach(function(option) {
          option.classList.toggle('active', option.dataset.theme === currentTheme);
        });
      } else {
        console.error('Theme modal not found - will retry once DOM is loaded');
        // Try again once DOM is fully loaded
        document.addEventListener('DOMContentLoaded', function() {
          const modalAfterLoad = document.getElementById('themeModal');
          if (modalAfterLoad) {
            console.log('Opening theme modal after DOM load');
            modalAfterLoad.classList.remove('hidden');
            const currentTheme = document.documentElement.getAttribute('data-theme') || 'default';
            document.querySelectorAll('.theme-option').forEach(function(option) {
              option.classList.toggle('active', option.dataset.theme === currentTheme);
            });
          }
        });
      }
    };

    window.closeThemeModal = function() {
      const modal = document.getElementById('themeModal');
      if (modal) {
        modal.classList.add('hidden');
      }
    };

    window.setTheme = function(theme) {
      console.log('Setting theme to:', theme);
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem('portfolio-theme', theme);
      // Update active theme option
      document.querySelectorAll('.theme-option').forEach(function(option) {
        option.classList.toggle('active', option.dataset.theme === theme);
      });
      // Close modal after selection
      window.closeThemeModal();
    };
  <\/script><!-- Favicon --><link rel="icon" type="image/x-icon" href="/assets/favicon.ico"><link rel="apple-touch-icon" sizes="180x180" href="/assets/apple-touch-icon.png"><link rel="icon" type="image/png" sizes="32x32" href="/assets/favicon-32x32.png"><link rel="icon" type="image/png" sizes="16x16" href="/assets/favicon-16x16.png"><link rel="manifest" href="/assets/site.webmanifest">`, '</head> <body data-astro-cid-37fxchfa> <!-- Skip to main content link for screen readers --> <a href="#main-content" class="skip-link" aria-label="Skip to main content" data-astro-cid-37fxchfa>Skip to main content</a> ', ' <!-- Screen reader only content --> <div class="sr-only" data-astro-cid-37fxchfa> <div data-astro-cid-37fxchfa>This website uses themes. Press Ctrl+T to cycle through available themes.</div> <div data-astro-cid-37fxchfa>Some elements on this page are interactive and can be dragged around.</div> </div> </body></html>'])), addAttribute(description, "content"), addAttribute(themeColor, "content"), addAttribute(robots, "content"), addAttribute(canonicalURL, "href"), addAttribute(canonicalURL, "content"), addAttribute(title, "content"), addAttribute(description, "content"), addAttribute(new URL(image, Astro2.url).href, "content"), addAttribute(canonicalURL, "content"), addAttribute(title, "content"), addAttribute(description, "content"), addAttribute(new URL(image, Astro2.url).href, "content"), title, renderHead(), renderSlot($$result, $$slots["default"]));
}, "/Users/joellithgow/Code/Personal/jlithgow2025/astro-migration/src/layouts/BaseLayout.astro", void 0);
export {
  $$BaseLayout as $
};
