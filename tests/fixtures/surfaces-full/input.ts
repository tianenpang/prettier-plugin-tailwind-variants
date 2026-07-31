import { tv } from 'tailwind-variants';

export const compoundVariantsSurfaces = tv({
  slots: {
    root: '',
    title: ''
  },
  compoundVariants: [
    {
      className: {
        root: ['text-white', 'bg-red-100'],
        title: 'mb-1 font-bold'
      }
    },
    {
      class: {
        root: ['p-2', 'border']
      }
    }
  ]
});

export const compoundSlotsSurfaces = tv({
  slots: {
    item: '',
    prev: '',
    next: ''
  },
  compoundSlots: [
    {
      slots: ['item', 'prev', 'next'],
      class: ['text-white', 'px-4', 'rounded-lg', 'py-2']
    },
    {
      slots: ['item'],
      className: ['font-medium', 'tracking-tight']
    }
  ]
});
