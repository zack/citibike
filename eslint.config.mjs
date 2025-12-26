import eslint from '@eslint/js';
import nextTs from 'eslint-config-next/typescript';
import nextVitals from 'eslint-config-next/core-web-vitals';
import prettier from 'eslint-config-prettier/flat';
import react from 'eslint-plugin-react';
import reactCompiler from 'eslint-plugin-react-compiler';
import stylistic from '@stylistic/eslint-plugin'
import tsParser from '@typescript-eslint/parser';
import tseslint from 'typescript-eslint';

import { defineConfig, globalIgnores } from 'eslint/config';

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  prettier,

  globalIgnores([
    '.next',
    '.next/**',
    'build/**',
    'next-env.d.ts',
    'out/**',
    'prisma/generated',
  ]),

  {
    plugins: {
      react,
      '@stylistic': stylistic,
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
  },

  eslint.configs.recommended,
  tseslint.configs.recommended,
  reactCompiler.configs.recommended,
]);
