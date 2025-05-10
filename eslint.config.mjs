import { FlatCompat } from '@eslint/eslintrc';
import { fileURLToPath } from 'node:url';

import js from '@eslint/js';
import path from 'node:path';
import reactCompiler from 'eslint-plugin-react-compiler';
import tsParser from '@typescript-eslint/parser';
import typescriptEslint from '@typescript-eslint/eslint-plugin';

import { defineConfig, globalIgnores } from 'eslint/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

export default defineConfig([
  globalIgnores([
    '.next',
  ]),

  {
    extends: compat.extends(
        'eslint:recommended',
        'next',
        'next/core-web-vitals',
        'plugin:@typescript-eslint/stylistic',
        'plugin:@typescript-eslint/recommended',
        'plugin:react/recommended',
        'prettier',
    ),

    plugins: {
        '@typescript-eslint': typescriptEslint,
        'react-compiler': reactCompiler,
    },

    languageOptions: {
        globals: {},
        parser: tsParser,
    },

    rules: {
        'react-compiler/react-compiler': 'error',
        'sort-imports': ['error', {
            memberSyntaxSortOrder: ['none', 'all', 'single', 'multiple'],
        }],
        'no-console': ['error'],
        '@/quotes': ['error', 'single', {
            avoidEscape: true,
        }],
        'no-unused-vars': 'off',
        '@typescript-eslint/no-unused-vars': ['error', {
            argsIgnorePattern: '^_',
            varsIgnorePattern: '^_',
        }],
    },
}]);
