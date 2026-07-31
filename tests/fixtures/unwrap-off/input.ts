import { tv } from 'tailwind-variants';

export const nested = tv({
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
