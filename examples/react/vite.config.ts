import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@ldesign/calendar-core': resolve(__dirname, '../../packages/core/src'),
      '@ldesign/calendar-react': resolve(__dirname, '../../packages/react/src'),
    },
  },
  server: {
    port: 3002,
  },
});

