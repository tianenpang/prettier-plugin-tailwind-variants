import { tv } from 'tailwind-variants';

export const arbitrary = tv({
  base: ['text-white', 'bg-[#ff0]', 'rounded-lg']
});

export const dataVariant = tv({
  base: ['text-white', 'data-[state=open]:bg-red-500', 'p-2']
});
