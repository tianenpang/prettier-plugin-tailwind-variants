import { tv } from 'tailwind-variants';

export const empties = tv({
  base: ['text-white', '', '  ', '\t', '\t\t', ' \t ', 'rounded-lg']
});

export const nestedBlanks = tv({
  base: ['px-4', ['', '  ', []], ['\t'], 'py-2']
});

export const blankOnly = tv({
  base: ['', '  ', '\t', []]
});

export const whitespaceString = tv({
  base: ' \t  '
});

export const emptyNestedArrays = tv({
  base: ['text-white', [], 'rounded-lg']
});
