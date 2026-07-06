import { defineConfig } from 'astro/config';
import { fileURLToPath, URL } from 'node:url';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';

// https://astro.build/config
export default defineConfig({
  output: 'static',
  site: 'https://joellithgow.com',
  server: { port: 4322 },
  integrations: [sitemap(), mdx()],
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
    plugins: [
      // In dev mode, expose /__cms-reload so the local CMS webhook can trigger
      // a full-page reload after a publish (content layer re-runs on next request).
      {
        name: 'cms-reload',
        configureServer(server) {
          server.middlewares.use('/__cms-reload', (_req, res) => {
            server.ws.send({ type: 'full-reload' });
            res.writeHead(204);
            res.end();
          });
        },
      },
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
        '@components': fileURLToPath(new URL('./src/components', import.meta.url)),
        '@layouts': fileURLToPath(new URL('./src/layouts', import.meta.url)),
        '@content': fileURLToPath(new URL('./src/content', import.meta.url)),
        '@styles': fileURLToPath(new URL('./src/styles', import.meta.url)),
        '@lib': fileURLToPath(new URL('./src/lib', import.meta.url)),
        '@features': fileURLToPath(new URL('./src/features', import.meta.url))
      }
    },
    build: {
      cssCodeSplit: true,
      rollupOptions: {
        output: {
          // Optimize chunk splitting for better caching
          manualChunks: {
            'vendor': ['astro'],
                'three': ['three'],
            'interactive': ['src/components/interactive/InteractiveElements.astro'],
            'snake': ['src/pages/snake.astro'],
            'themes': ['src/features/themes/index.ts'],
            'artworks': ['src/features/artworks/index.ts']
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