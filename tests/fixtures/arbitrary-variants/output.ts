import { tv } from 'tailwind-variants';

export const arbitrary = tv({
  base: ['rounded-lg', 'bg-[#ff0]', 'text-white']
});

export const dataVariant = tv({
  base: ['p-2', 'text-white', 'data-[state=open]:bg-red-500']
});
