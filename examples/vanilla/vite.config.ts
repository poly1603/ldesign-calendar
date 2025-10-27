import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@ldesign/calendar-core': resolve(__dirname, '../../packages/core/src'),
    },
  },
  server: {
    port: 3000,
  },
});

