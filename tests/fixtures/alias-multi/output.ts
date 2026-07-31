import { tv as createTv } from 'tailwind-variants';

const makeButton = createTv;
const makeBadge = createTv;

export const fromImportAlias = createTv({
  base: ['rounded-lg', 'px-4', 'text-white']
});

export const fromLocalAlias = makeButton({
  base: ['rounded-md', 'px-3', 'py-2', 'text-black']
});

export const secondLocalAlias = makeBadge({
  base: ['rounded-full', 'bg-gray-100', 'px-2', 'text-sm']
});
