import { tv } from 'tailwind-variants';

export const nested = tv({
  base: ['rounded-lg', ['px-4', 'py-2'], 'text-white'],
  slots: {
    buyButton: ''
  },
  variants: {
    color: {
      primary: {
        buyButton: ['bg-blue-500', 'shadow-blue-500/50']
      }
    }
  }
});

export const deepNest = tv({
  base: ['rounded-lg', 'px-4', 'text-white']
});

export const mixed = tv({
  base: ['absolute', 'px-4 py-2', ['flex', 'gap-2'], 'z-10']
});

export const multiClassString = tv({
  base: ['rounded-lg', 'px-4 py-2', 'text-white']
});
