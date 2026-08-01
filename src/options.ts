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
      'Unwrap nested single-class arrays into the parent sort pool. When false, keep nesting. Ignored when grouping or flattening.'
  },
  tvGroupByModifiers: {
    category: 'Global',
    type: 'boolean',
    default: false,
    description:
      'Split class tokens into one string per modifier group (base, hover, dark, responsive, …).'
  },
  tvModifierGroupOrder: {
    category: 'Global',
    type: 'string',
    array: true,
    default: [{ value: [] }],
    description:
      'Order of modifier group ids when tvGroupByModifiers is true. Empty uses the built-in order. Ignored when grouping is off.'
  },
  tvFlattenToString: {
    category: 'Global',
    type: 'boolean',
    default: false,
    description:
      'Flatten arrays / nested arrays into a single class string. Ignored for final shape when tvGroupByModifiers is true.'
  },
  tvRemoveEmptyClasses: {
    category: 'Global',
    type: 'boolean',
    default: true,
    description: 'Remove empty / whitespace-only class strings and empty arrays.'
  },
  tvGroupByBreakpoints: {
    category: 'Global',
    type: 'boolean',
    default: false,
    description:
      'When tvGroupByModifiers is true, put each breakpoint (sm, md, …) in its own group instead of one responsive group. Ignored when grouping is off.'
  }
} satisfies SupportOptions;

export const tvDefaultOptions = {
  tvFunctions: ['tv'],
  tvUnwrapSingleClassArrays: true,
  tvGroupByModifiers: false,
  tvModifierGroupOrder: [] as string[],
  tvFlattenToString: false,
  tvRemoveEmptyClasses: true,
  tvGroupByBreakpoints: false
};

export type { PluginOptions } from './types.js';
