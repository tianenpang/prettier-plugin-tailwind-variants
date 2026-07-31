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
      class: ['text-white', 'bg-red-100', 'px-2']
    },
    {
      size: 'lg',
      className: {
        root: ['p-4', 'border', 'rounded-lg'],
        title: 'mb-1 font-bold text-lg'
      }
    }
  ],
  compoundSlots: [
    {
      slots: ['item', 'icon'],
      size: ['sm', 'md'],
      class: ['shrink-0', 'inline-block', 'text-sm']
    }
  ],
  defaultVariants: {
    size: 'md',
    color: 'primary',
    isActive: false
  }
});
