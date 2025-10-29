import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/composables/useCalendar.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  sourcemap: true,
  clean: false,
  external: ['vue', '@ldesign/calendar-core'],
  target: 'es2020',
  outDir: 'dist/composables',
});

