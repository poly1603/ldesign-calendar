import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@ldesign/calendar': path.resolve(__dirname, '../src/index.ts'),
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 8001,
    open: true,
    host: true,
  },
});

