import { defineConfig } from '@ldesign/builder'

export default defineConfig({
  input: 'src/index.ts',
  output: {
    esm: {
      dir: 'dist',
      preserveStructure: true,
      dts: true,
    },
    cjs: {
      dir: 'dist',
      preserveStructure: true,
      dts: false,
    },
  },
  external: [],
  formats: ['esm', 'cjs'],
  dts: true,
  sourcemap: true,
  minify: false,
  clean: true,
})
