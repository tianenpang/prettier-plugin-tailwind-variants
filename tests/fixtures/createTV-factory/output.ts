import { createTV } from 'tailwind-variants';

const appTv = createTV({});

export const button = appTv({
  base: ['rounded-lg', 'px-4', 'py-2', 'text-white'],
  slots: {
    icon: ['h-4', 'w-4']
  },
  variants: {
    size: {
      sm: { icon: ['h-3', 'w-3'] }
    }
  }
});
