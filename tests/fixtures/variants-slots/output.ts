import { tv } from 'tailwind-variants';

export const heading = tv({
  slots: {
    root: '',
    title: ''
  },
  variants: {
    size: {
      sm: {
        root: ['p-2', 'text-white'],
        title: 'text-sm font-bold'
      },
      lg: {
        root: ['text-black', ['px-6', 'py-4']],
        title: ['text-xl', 'font-semibold']
      }
    }
  }
});
