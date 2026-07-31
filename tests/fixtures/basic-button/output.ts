import { tv } from 'tailwind-variants';

export const button = tv({
  base: ['rounded-lg', 'px-4', 'py-2', 'text-white'],
  slots: {
    icon: ['h-4', 'w-4']
  },
  variants: {
    size: {
      sm: { icon: ['h-3', 'w-3'] }
    }
  },
  compoundSlots: [
    {
      slots: ['icon'],
      class: ['inline-block', 'shrink-0']
    }
  ]
});
