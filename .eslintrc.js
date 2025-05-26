module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: [
    '@typescript-eslint',
    'import',
    'prettier'
  ],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:import/typescript',
    'plugin:prettier/recommended'
  ],
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    project: null,
  },
  env: {
    browser: true,
    es6: true,
    node: true
  },
  rules: {
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    'no-console': 'warn',
    'prettier/prettier': 'error',
    'semi': ['error', 'always'],
    'quotes': ['error', 'single']
  },
  ignorePatterns: ['dist/', 'node_modules/', 'webpack.config.js']
}; 