# Joel Lithgow Portfolio - Astro.js

A modern, component-based portfolio website built with **Astro.js**, showcasing creative technology work through interactive components and optimized performance.

## 🚀 Features

- **Modern Astro.js Architecture**: Static site generation with component islands
- **7 Dynamic Themes**: Electric, Retro, Minimal, System, High-contrast, Neon, and Default  
- **Responsive Design**: Optimized for all screen sizes with mobile-first approach
- **Accessibility**: WCAG 2.1 AA compliant with screen reader support
- **Performance Optimized**: Fast loading with Astro's static generation
- **Interactive Elements**: Draggable floating elements, smooth scrolling, animations
- **Component-Based**: Reusable Astro components with separation of concerns
- **TypeScript Support**: Enhanced development experience with type safety

## 📁 Project Structure

```
portfolio/
├── README.md                    # Project documentation
├── package.json                 # Dependencies and scripts
├── astro.config.mjs            # Astro configuration
├── tsconfig.json               # TypeScript configuration
├── netlify.toml                # Deployment configuration
├── public/                     # Static assets
│   └── assets/
│       └── images/             # Optimized images and media
├── src/                        # Source code
│   ├── components/             # Astro components
│   │   ├── About.astro         # About section component
│   │   ├── Contact.astro       # Contact section with floating elements
│   │   ├── Hero.astro          # Hero section with animations
│   │   ├── Navigation.astro    # Site navigation
│   │   ├── Projects.astro      # Projects showcase
│   │   ├── Process.astro       # Process explanation
│   │   └── *.astro            # Interactive and utility components
│   ├── content/               # Content collections
│   │   ├── config.ts          # Content configuration
│   │   └── projects/          # Project case studies (JSON)
│   ├── layouts/               # Page layouts
│   │   └── BaseLayout.astro   # Base page template
│   ├── pages/                 # Route pages
│   │   ├── index.astro        # Homepage
│   │   └── snake.astro        # Snake game easter egg
│   ├── styles/                # Global styles
│   │   └── themes.css         # Theme system and CSS variables
│   └── utils/                 # Utility functions
│       └── themes.ts          # Theme management utilities
├── dist/                      # Build output (auto-generated)
└── archive/                   # Historical project files
```

## 🎨 Astro.js Migration Benefits

### Before (Legacy Vanilla JS)
- **Monolithic structure** with large single files
- **Manual component management** and duplication
- **Complex build process** with service workers
- **Limited performance optimization**

### After (Astro.js)
- **Component-based architecture** with `.astro` files
- **Static site generation** for optimal performance
- **Island architecture** for selective hydration
- **Built-in optimizations** (image optimization, CSS bundling)
- **Modern developer experience** with TypeScript support

## 🔧 Technical Stack

### Core Technologies
- **Astro.js 5.12+**: Static site generation framework
- **TypeScript**: Enhanced development with type safety
- **CSS Custom Properties**: Theme system with 7 variations
- **Modern JavaScript**: ES6+ with component islands

### Component Architecture
- **Hero.astro**: Landing section with floating interactive elements
- **Projects.astro**: Horizontal scrolling project showcase
- **Contact.astro**: Contact section with repositioned floating elements
- **InteractiveElements.astro**: Modals, themes, and dynamic behaviors
- **UIInteractions.astro**: Scroll animations and hover effects

### Performance Features
- **Static Generation**: Pre-built pages for fast loading
- **Component Islands**: Selective JavaScript hydration
- **Image Optimization**: Built-in asset optimization
- **CSS Bundling**: Automatic style optimization
- **Modern Build Pipeline**: Vite-powered development

## 🎯 Key Interactive Features

### Theme System
- **7 unique themes** with distinct visual personalities
- **Keyboard shortcut** (Ctrl+T) for quick theme cycling
- **LocalStorage persistence** remembers user preference
- **CSS custom properties** for consistent theming

### Floating Elements
- **Repositioned contact elements** for better visual hierarchy
- **Draggable interactions** maintained from legacy version
- **Coffee element** moved to top 20% positioning
- **Direct child** of contact section for better control

### Navigation & UX
- **Smooth scrolling** with active state tracking
- **Accessibility focused** with proper ARIA labels
- **Mobile responsive** with touch-friendly interactions
- **Snake game easter egg** accessible via navigation

## 🛠 Development

### Prerequisites
- **Node.js 18+**
- **npm** or **yarn**

### Local Development
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run check` - Run TypeScript type checking
- `netlify deploy --prod --dir=dist` - Deploy to production

## 🚀 Deployment

### Netlify (Recommended)
The site is configured for automatic deployment on Netlify:
- **Build command**: `npm run build`
- **Publish directory**: `dist`
- **Node version**: 18+

### Manual Deployment
```bash
# Build and deploy to Netlify production
npm run build
netlify deploy --prod --dir=dist

# Or upload contents of dist/ folder to your hosting provider
```

## 📊 Performance Metrics

### Astro.js Optimizations
- **Static HTML generation** for instant loading
- **Selective hydration** with component islands
- **Automatic asset optimization** (images, CSS, JS)
- **Modern browser targets** with fallbacks

### Build Output
- **Optimized bundles** with code splitting
- **CSS extraction** and minification
- **Image processing** with WebP conversion
- **JavaScript tree shaking** for minimal payload

## 🧩 Component Highlights

### Recent Improvements
- **Contact floating elements** moved to direct child of contact section
- **Coffee element positioning** optimized to top 20% for better hierarchy
- **Component architecture** fully migrated to Astro.js patterns
- **Build process** streamlined with modern tooling

### Interactive Components
- **Draggable floating elements** with touch support
- **Theme selector modal** with live preview
- **Project case study modals** with detailed information
- **Snake game integration** as easter egg feature

## 🔍 Architecture Decisions

### Component Organization
- **Single-file components** with HTML, CSS, and JavaScript
- **Props-based data flow** for reusable components
- **Scoped styling** to prevent CSS conflicts
- **TypeScript integration** for development safety

### Content Management
- **JSON-based project data** in content collections
- **Static asset optimization** through Astro pipeline
- **Theme configuration** via CSS custom properties
- **Responsive design** with mobile-first approach

## 🌟 Future Enhancements

### Planned Features
- **Content Management System** integration
- **Enhanced animations** with view transitions
- **Progressive Web App** features
- **Advanced TypeScript** implementation
- **Performance monitoring** integration

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

Contributions are welcome! The codebase is now fully modernized with Astro.js.

---

**Joel Lithgow** - Creative Technologist  
Portfolio: [joellithgow.com](https://joellithgow.com) | [LinkedIn](https://linkedin.com/in/joellithgow) | [GitHub](https://github.com/joellithgow)