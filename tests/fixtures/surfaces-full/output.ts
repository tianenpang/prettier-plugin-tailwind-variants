import { tv } from 'tailwind-variants';

export const compoundVariantsSurfaces = tv({
  slots: {
    root: '',
    title: ''
  },
  compoundVariants: [
    {
      className: {
        root: ['bg-red-100', 'text-white'],
        title: 'mb-1 font-bold'
      }
    },
    {
      class: {
        root: ['border', 'p-2']
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
      class: ['rounded-lg', 'px-4', 'py-2', 'text-white']
    },
    {
      slots: ['item'],
      className: ['font-medium', 'tracking-tight']
    }
  ]
});
