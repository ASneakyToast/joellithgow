import { defineConfig } from 'astro/config';
import { fileURLToPath, URL } from 'node:url';

// https://astro.build/config
export default defineConfig({
  output: 'static',
  build: {
    assets: 'assets'
  },
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
    }
  }
});