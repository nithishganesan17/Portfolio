import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
<<<<<<< HEAD
  base: '/',
=======
>>>>>>> fa666d3fd4e5a7dbf6ed1775fa6252f1c79395ee
  server: {
    port: 5173,
    open: false,
    host: true,
    watch: {
      ignored: ['**/*.pdf', '**/dist/**', '**/*.tmp']
    }
  },
  build: {
<<<<<<< HEAD
    outDir: 'dist',
=======
>>>>>>> fa666d3fd4e5a7dbf6ed1775fa6252f1c79395ee
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        reference3d: resolve(__dirname, '3d.html')
      }
    }
  }
});
