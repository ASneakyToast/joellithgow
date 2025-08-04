import { defineConfig } from 'astro/config';
import { fileURLToPath, URL } from 'node:url';

// https://astro.build/config
export default defineConfig({
  output: 'static',
  site: 'https://joellithgow.com', // Replace with actual site URL
  build: {
    assets: 'assets',
    inlineStylesheets: 'auto',
    splitting: true
  },
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'viewport'
  },
  image: {
    service: {
      entrypoint: 'astro/assets/services/sharp'
    }
  },
  compressHTML: true,
  vite: {
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
        '@components': fileURLToPath(new URL('./src/components', import.meta.url)),
        '@layouts': fileURLToPath(new URL('./src/layouts', import.meta.url)),
        '@content': fileURLToPath(new URL('./src/content', import.meta.url)),
        '@styles': fileURLToPath(new URL('./src/styles', import.meta.url)),
        '@utils': fileURLToPath(new URL('./src/utils', import.meta.url))
      }
    },
    build: {
      cssCodeSplit: true,
      rollupOptions: {
        output: {
          // Optimize chunk splitting for better caching
          manualChunks: {
            'vendor': ['astro'],
            'interactive': ['@components/InteractiveElements.astro'],
            'snake': ['src/pages/snake.astro']
          },
          // Optimize asset naming for better caching
          chunkFileNames: 'assets/js/[name]-[hash].js',
          entryFileNames: 'assets/js/[name]-[hash].js',
          assetFileNames: (assetInfo) => {
            const extType = assetInfo.name ? assetInfo.name.split('.').pop() : '';
            if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(extType)) {
              return `assets/images/[name]-[hash][extname]`;
            }
            if (/css/i.test(extType)) {
              return `assets/css/[name]-[hash][extname]`;
            }
            return `assets/[name]-[hash][extname]`;
          }
        }
      },
      target: 'es2020',
      minify: 'esbuild'
    },
    optimizeDeps: {
      include: [],
      exclude: ['@astrojs/components']
    }
  }
});