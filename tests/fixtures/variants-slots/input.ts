import { tv } from 'tailwind-variants';

export const heading = tv({
  slots: {
    root: '',
    title: ''
  },
  variants: {
    size: {
      sm: {
        root: ['text-white', 'p-2'],
        title: 'font-bold text-sm'
      },
      lg: {
        root: ['text-black', ['px-6', 'py-4']],
        title: ['text-xl', ['font-semibold']]
      }
    }
  }
});
