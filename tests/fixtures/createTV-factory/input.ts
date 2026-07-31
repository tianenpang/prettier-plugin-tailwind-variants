import { createTV } from 'tailwind-variants';

const appTv = createTV({});

export const button = appTv({
  base: ['text-white', 'px-4', 'rounded-lg', 'py-2'],
  slots: {
    icon: ['w-4', 'h-4']
  },
  variants: {
    size: {
      sm: { icon: ['w-3', 'h-3'] }
    }
  }
});
