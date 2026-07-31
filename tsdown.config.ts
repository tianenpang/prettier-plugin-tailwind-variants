import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: {
    index: './src/index.ts'
  },
  format: ['esm'],
  platform: 'node',
  target: 'node22',
  dts: true,
  clean: true,
  hash: false,
  fixedExtension: true,
  deps: {
    neverBundle: [
      'prettier',
      'prettier/plugins/typescript.mjs',
      'prettier/plugins/babel.mjs',
      'prettier-plugin-tailwindcss',
      'prettier-plugin-tailwindcss/sorter'
    ]
  }
});
