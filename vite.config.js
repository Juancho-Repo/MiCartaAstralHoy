import { defineConfig } from 'vite';
import { resolve } from 'path';

// Config Vite: MPA con index + reservar + gracias, build minificado para produccion.
export default defineConfig({
  root: '.',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    minify: 'esbuild',
    cssMinify: true,
    rollupOptions: {
      input: {
        main: resolve(process.cwd(), 'index.html'),
        reservar: resolve(process.cwd(), 'reservar.html'),
        gracias: resolve(process.cwd(), 'gracias.html'),
        politicas: resolve(process.cwd(), 'politicas.html')
      }
    }
  },
  test: {
    environment: 'jsdom',
    include: ['tests/**/*.test.js']
  }
});
