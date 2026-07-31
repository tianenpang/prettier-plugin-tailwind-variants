import eslint from '@eslint/js';
import { defineConfig, globalIgnores } from 'eslint/config';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import tseslint from 'typescript-eslint';

export default defineConfig(
  globalIgnores(['dist/**', 'node_modules/**', 'coverage/**', 'pnpm-lock.yaml']),

  eslint.configs.recommended,

  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,

  {
    languageOptions: {
      parserOptions: {
        projectService: {
          allowDefaultProject: ['*.js', '*.mjs', '*.cjs']
        },
        tsconfigRootDir: import.meta.dirname
      }
    }
  },

  {
    files: ['**/*.{ts,mts}'],
    rules: {
      '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' }
      ],
      '@typescript-eslint/array-type': ['error', { default: 'array-simple' }],
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_'
        }
      ],
      // ESTree / Prettier plugin surfaces are inherently loosely typed
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      // ESTree nodes use index signatures; defensive runtime checks look "unnecessary" to TS
      '@typescript-eslint/no-unnecessary-condition': 'off',
      '@typescript-eslint/prefer-optional-chain': 'off',
      '@typescript-eslint/restrict-template-expressions': [
        'error',
        { allowNumber: true, allowBoolean: true }
      ]
    }
  },

  {
    files: ['src/**/*.{ts,mts}'],
    rules: {
      'func-style': ['error', 'expression', { allowArrowFunctions: true }],
      'prefer-arrow-callback': 'error'
    }
  },

  {
    files: ['benchmark/**/*.{js,mjs}', 'prettier.config.js'],
    extends: [tseslint.configs.disableTypeChecked],
    rules: {
      'no-undef': 'off',
      // ANSI color helpers intentionally match ESC
      'no-control-regex': 'off'
    }
  },

  // Runs Prettier as `prettier/prettier` and disables conflicting ESLint stylistic rules
  // (includes eslint-config-prettier — do not also add eslint-config-prettier separately)
  eslintPluginPrettierRecommended
);
