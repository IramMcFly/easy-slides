import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  site: 'https://easyslides.irammcfly.dev',
  vite: {
    build: {
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('pdfjs-dist')) {
                return 'vendor-pdfjs';
              }
              if (id.includes('pptx-preview')) {
                return 'vendor-pptx';
              }
              return 'vendor-core';
            }
          }
        }
      }
    }
  }
});
