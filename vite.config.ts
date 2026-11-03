import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// VITE_BASE lets CI set the GitHub Pages sub-path (e.g. "/weather/").
export default defineConfig({
  base: process.env.VITE_BASE ?? '/',
  plugins: [react()],
  server: { port: 5173 },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    css: false,
  },
});
