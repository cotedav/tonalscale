module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  parser: 'vue-eslint-parser',
  parserOptions: {
    parser: '@typescript-eslint/parser',
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  extends: [
    'airbnb-base',
    'plugin:vue/vue3-recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:import/typescript',
    'plugin:prettier/recommended',
  ],
  plugins: ['@typescript-eslint', 'vue', 'prettier', 'vitest', 'cypress'],
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx', '.d.ts', '.vue'],
      },
      typescript: {
        project: ['./tsconfig.json', './tsconfig.node.json', './tsconfig.cypress.json'],
      },
    },
    'import/extensions': ['.js', '.jsx', '.ts', '.tsx', '.mjs', '.vue'],
  },
  rules: {
    'prettier/prettier': 'warn',
    'import/extensions': [
      'error',
      'ignorePackages',
      {
        js: 'never',
        jsx: 'never',
        ts: 'never',
        tsx: 'never',
        mjs: 'never',
        vue: 'always',
      },
    ],
    'import/no-extraneous-dependencies': [
      'error',
      {
        devDependencies: [
          '**/*.config.*',
          '**/*.test.*',
          '**/*.spec.*',
          'cypress/**',
          'src/tests/**',
          'tests/**',
          'vite.config.ts',
        ],
      },
    ],
    'vue/multi-word-component-names': 'off',
  },
  overrides: [
    {
      files: [
        '**/__tests__/**/*.{j,t}s?(x)',
        '**/*.{spec,test}.{j,t}s?(x)',
        '**/cypress/**/*.{j,t}s?(x)',
      ],
      env: {
        'vitest/env': true,
        'cypress/globals': true,
      },
    },
    {
      files: ['*.vue'],
      parser: 'vue-eslint-parser',
      parserOptions: {
        parser: '@typescript-eslint/parser',
        extraFileExtensions: ['.vue'],
      },
    },
  ],
};
