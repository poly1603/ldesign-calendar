import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  sourcemap: true,
  clean: true,
  external: ['vue', '@ldesign/calendar-core'],
  target: 'es2020',
  outDir: 'dist',
});

