import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const stylesheet = path.resolve(__dirname, '../tests/fixtures/stylesheet.css');

/** Large multi-slot / variants / compounds object (same as fixtures/real-card). */
export const realCard = readFileSync(
  path.resolve(__dirname, '../tests/fixtures/real-card/input.ts'),
  'utf8'
);

export const noTv = `
export const label = 'rounded-lg px-4 py-2 text-white'
`;

export const stringOnly = `
import { tv } from 'tailwind-variants'

export const button = tv({
  base: 'text-white px-4 rounded-lg py-2',
  variants: {
    size: {
      sm: 'text-sm px-2',
      lg: 'text-lg px-6 py-3',
    },
  },
})
`;

export const flatArray = `
import { tv } from 'tailwind-variants'

export const button = tv({
  base: ['text-white', 'px-4', 'rounded-lg', 'py-2', 'font-medium', 'shadow-sm'],
  variants: {
    color: {
      primary: ['bg-blue-500', 'text-white', 'hover:bg-blue-600'],
      secondary: ['bg-purple-500', 'text-white', 'hover:bg-purple-600'],
    },
    size: {
      sm: ['text-sm', 'px-2', 'py-1'],
      lg: ['text-lg', 'px-6', 'py-3'],
    },
  },
})
`;

export const nestedArray = `
import { tv } from 'tailwind-variants'

export const button = tv({
  base: ['text-white', ['py-2', 'px-4'], 'rounded-lg', ['font-medium'], 'shadow-sm'],
  slots: {
    icon: ['w-4', 'h-4', ['shrink-0']],
  },
  variants: {
    color: {
      primary: {
        base: ['bg-blue-500', ['hover:bg-blue-600'], 'text-white'],
        icon: ['text-blue-100', 'opacity-90'],
      },
    },
  },
  compoundVariants: [
    {
      color: 'primary',
      class: ['ring-2', 'ring-blue-300', ['ring-offset-2']],
    },
  ],
})
`;

export const multiTv = `
import { tv } from 'tailwind-variants'

export const button = tv({
  base: ['text-white', 'px-4', 'rounded-lg', 'py-2'],
})

export const input = tv({
  base: ['border', 'rounded-md', 'px-3', 'py-2', 'text-sm'],
  variants: {
    invalid: {
      true: ['border-red-500', 'text-red-700', 'focus:ring-red-500'],
    },
  },
})

export const card = tv({
  slots: {
    base: ['rounded-xl', 'bg-white', 'shadow-sm', 'p-4'],
    title: ['font-semibold', 'text-lg', 'mb-2'],
  },
})
`;

export const vueScript = `<template>
  <button :class="button()" />
</template>

<script setup lang="ts">
import { tv } from 'tailwind-variants'

const button = tv({
  base: ['text-white', 'px-4', 'rounded-lg', 'py-2', 'font-medium'],
  variants: {
    size: {
      sm: ['text-sm', 'px-2'],
      lg: ['text-lg', 'px-6', 'py-3'],
    },
  },
})
</script>
`;
