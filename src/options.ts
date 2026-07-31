import type { SupportOptions } from 'prettier';

export const tvPrettierOptions = {
  tvFunctions: {
    category: 'Global',
    type: 'string',
    array: true,
    default: [{ value: ['tv'] }],
    description:
      'Function names treated as Tailwind Variants entry points when normalizing class values.'
  },
  tvUnwrapSingleClassArrays: {
    category: 'Global',
    type: 'boolean',
    default: true,
    description:
      'Unwrap nested single-class arrays into the parent sort pool. When false, keep nesting.'
  }
} satisfies SupportOptions;

export const tvDefaultOptions = {
  tvFunctions: ['tv'],
  tvUnwrapSingleClassArrays: true
};

export type { PluginOptions } from './types.js';
