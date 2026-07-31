import { tv } from 'tailwind-variants';

export const compoundEdges = tv({
  slots: {
    root: '',
    title: '',
    item: '',
    icon: ''
  },
  variants: {
    size: {
      sm: '',
      md: '',
      lg: ''
    },
    color: {
      primary: '',
      secondary: ''
    },
    isActive: {
      true: '',
      false: ''
    }
  },
  compoundVariants: [
    {
      size: ['sm', 'md'],
      color: 'primary',
      isActive: true,
      class: ['bg-red-100', 'px-2', 'text-white']
    },
    {
      size: 'lg',
      className: {
        root: ['rounded-lg', 'border', 'p-4'],
        title: 'mb-1 text-lg font-bold'
      }
    }
  ],
  compoundSlots: [
    {
      slots: ['item', 'icon'],
      size: ['sm', 'md'],
      class: ['inline-block', 'shrink-0', 'text-sm']
    }
  ],
  defaultVariants: {
    size: 'md',
    color: 'primary',
    isActive: false
  }
});
