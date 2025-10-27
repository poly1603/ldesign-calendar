/**
 * @ldesign/calendar build configuration
 */

import { defineConfig } from '@ldesign/builder';

export default defineConfig({
  // 基础配置
  name: '@ldesign/calendar',
  input: 'src/index.ts',

  // 输出格式 - 简化配置
  output: {
    format: ['esm', 'cjs'],
    dir: 'dist',
    sourcemap: true,
  },

  // 明确禁用 UMD
  umd: {
    enabled: false,
  },

  // TypeScript 配置
  dts: true,

  // 外部依赖
  external: [
    'vue',
    'react',
    'react-dom',
    '@ldesign/shared',
  ],

  // 排除文件
  exclude: [
    '**/demo/**',
    '**/examples/**',
    '**/__tests__/**',
    '**/*.test.*',
    '**/*.spec.*',
  ],
});