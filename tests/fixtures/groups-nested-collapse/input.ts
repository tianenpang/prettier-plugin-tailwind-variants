import { tv } from 'tailwind-variants';

export const nested = tv({
  base: ['text-white', ['hover:bg-red-500', 'px-4'], 'py-2']
});
