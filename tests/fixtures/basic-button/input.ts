import { tv } from 'tailwind-variants';

export const button = tv({
  base: ['text-white', 'px-4', 'rounded-lg', 'py-2'],
  slots: {
    icon: ['w-4', 'h-4']
  },
  variants: {
    size: {
      sm: { icon: ['w-3', 'h-3'] }
    }
  },
  compoundSlots: [
    {
      slots: ['icon'],
      class: ['shrink-0', 'inline-block']
    }
  ]
});
