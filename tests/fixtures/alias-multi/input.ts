import { tv as createTv } from 'tailwind-variants';

const makeButton = createTv;
const makeBadge = createTv;

export const fromImportAlias = createTv({
  base: ['text-white', 'px-4', 'rounded-lg']
});

export const fromLocalAlias = makeButton({
  base: ['py-2', 'text-black', 'rounded-md', 'px-3']
});

export const secondLocalAlias = makeBadge({
  base: ['text-sm', 'rounded-full', 'px-2', 'bg-gray-100']
});
