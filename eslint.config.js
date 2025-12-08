import js from '@eslint/js';
import compat from 'eslint-plugin-compat';
import prettier from 'eslint-plugin-prettier';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import { defineConfig } from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig(
  { ignores: ['dist'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      prettier,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      'prettier/prettier': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_+.*$', varsIgnorePattern: '^_+$' },
      ],
    },
  },

  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    plugins: {
      compat,
    },
    rules: {
      // Fail CI if an unsupported Web API is used
      'compat/compat': 'error',
    },
    // // Option B (recommended): omit `settings.targets` and define Browserslist in package.json.
    // // eslint-plugin-compat will read it automatically:
    // browserslist: ['>0.5%', 'last 2 versions', 'not dead'],
  },
);
