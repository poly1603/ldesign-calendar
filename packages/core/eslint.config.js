import antfu from '@antfu/eslint-config'

export default antfu({
  typescript: true,
  vue: false,
  react: false,
  rules: {
    // 控制台警告而非错误（开发时可能需要）
    'no-console': 'warn',
    'no-debugger': 'error',
    
    // TypeScript严格规则
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/explicit-function-return-type': ['warn', {
      allowExpressions: true,
      allowTypedFunctionExpressions: true,
    }],
    '@typescript-eslint/no-unused-vars': ['error', {
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_',
    }],
    
    // 代码风格
    'curly': ['error', 'all'],
    'brace-style': ['error', '1tbs'],
    
    // 导入规则
    'import/order': ['error', {
      'groups': [
        'builtin',
        'external',
        'internal',
        'parent',
        'sibling',
        'index',
      ],
      'newlines-between': 'always',
      'alphabetize': {
        'order': 'asc',
        'caseInsensitive': true,
      },
    }],
  },
})
