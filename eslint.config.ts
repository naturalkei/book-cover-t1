import js from '@eslint/js'
import stylistic from '@stylistic/eslint-plugin'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig } from 'eslint/config'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default defineConfig([
  { ignores: ['dist'] },
  
  // Base Configs (Spread Syntax)
  js.configs.recommended,
  ...tseslint.configs.recommended,
  
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      '@stylistic': stylistic,
    },
    // Note: ensure plugins support flat config 'extends' or use tseslint.config if needed
    extends: [
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    rules: {
      // General Linting
      '@typescript-eslint/no-unused-vars': 'warn',

      // Stylistic Rules (No Prettier Needed)
      '@stylistic/semi': ['error', 'never'],
      '@stylistic/quotes': ['error', 'single'],
      '@stylistic/jsx-quotes': ['error', 'prefer-double'],
      '@stylistic/indent': ['error', 2],
      
      // Spacing & Formatting Details
      '@stylistic/object-curly-spacing': ['error', 'always'],
      '@stylistic/no-multiple-empty-lines': ['error', { max: 1, maxEOF: 0 }],
      '@stylistic/comma-dangle': ['error', 'always-multiline'],
    },
  },
])
