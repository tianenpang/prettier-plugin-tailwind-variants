import { tv } from 'tailwind-variants';

export const nested = tv({
  base: ['text-white', ['py-2', 'px-4'], 'rounded-lg'],
  slots: {
    buyButton: ''
  },
  variants: {
    color: {
      primary: {
        buyButton: ['shadow-blue-500/50', ['bg-blue-500']]
      }
    }
  }
});

export const deepNest = tv({
  base: ['text-white', [['px-4']], 'rounded-lg']
});

export const mixed = tv({
  base: ['z-10', 'py-2 px-4', ['gap-2', 'flex'], 'absolute']
});

export const multiClassString = tv({
  base: ['text-white', 'py-2 px-4', 'rounded-lg']
});
