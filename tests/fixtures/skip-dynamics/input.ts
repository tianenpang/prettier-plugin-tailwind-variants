import { tv } from 'tailwind-variants';

const extra = 'px-2';
const more = ['px-2'] as const;
const tone = '500';

export const withIdentifier = tv({
  base: ['text-white', extra, 'rounded-lg']
});

export const withSpread = tv({
  base: ['text-white', ...more]
});

export const withDynamicTemplate = tv({
  base: `bg-blue-${tone} text-white`
});

export const withDynamicBesideStatic = tv({
  base: ['text-white', `bg-blue-${tone}`, 'rounded-lg']
});
