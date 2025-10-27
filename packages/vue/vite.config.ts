import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';

export default defineConfig({
  plugins: [vue()],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'LDesignCalendarVue',
      fileName: (format) => `index.${format === 'es' ? 'js' : 'cjs'}`,
    },
    rollupOptions: {
      external: ['vue', '@ldesign/calendar-core'],
      output: {
        globals: {
          vue: 'Vue',
          '@ldesign/calendar-core': 'LDesignCalendarCore',
        },
      },
    },
  },
});

