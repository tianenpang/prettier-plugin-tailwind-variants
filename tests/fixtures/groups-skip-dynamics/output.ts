import { tv } from 'tailwind-variants';

const extra = 'px-2';

export const withIdentifier = tv({
  base: ['text-white', extra, 'hover:bg-red-500']
});
