import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  base: '/',
  server: {
    port: 5173,
    open: false,
    host: true,
    watch: {
      ignored: ['**/*.pdf', '**/dist/**', '**/*.tmp']
    }
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        reference3d: resolve(__dirname, '3d.html')
      }
    }
  }
});
