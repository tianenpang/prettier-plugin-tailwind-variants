import { describe, expect, it } from 'vitest';
import { formatStandalone, formatWithTv } from './utils.js';

describe('option wiring', () => {
  it('tvUnwrapSingleClassArrays:false keeps nested single array slot', async () => {
    const out = await formatWithTv(
      `import { tv } from 'tailwind-variants'
export const x = tv({
  slots: { buyButton: '' },
  variants: { color: { primary: { buyButton: ['shadow-blue-500/50', ['bg-blue-500']] } } },
})
`,
      { tvUnwrapSingleClassArrays: false }
    );
    expect(out).toMatch(/\['shadow-blue-500\/50', \['bg-blue-500'\]\]/);
  });

  it('tvFunctions alias', async () => {
    const out = await formatWithTv(
      `import { tv as createTv } from 'tailwind-variants'
export const x = createTv({ base: ['text-white', 'px-4'] })
`,
      { tvFunctions: ['createTv'], tailwindFunctions: ['createTv'] }
    );
    expect(out).toMatch(/base: \['px-4', 'text-white'\]/);
  });

  it('createButtonTv alias via tvFunctions', async () => {
    const out = await formatWithTv(
      `const createButtonTv = (opts: any) => opts
export const x = createButtonTv({ base: ['text-white', 'rounded-lg', 'px-4'] })
`,
      {
        tvFunctions: ['createButtonTv'],
        tailwindFunctions: ['createButtonTv']
      }
    );
    expect(out).toMatch(/base: \['rounded-lg', 'px-4', 'text-white'\]/);
  });
});

describe('edge: non-literal hole (not fixture-friendly)', () => {
  it('skips array with hole', async () => {
    const out = await formatWithTv(`import { tv } from 'tailwind-variants'
export const x = tv({ base: ['text-white', , 'rounded-lg'] })
`);
    expect(out).toMatch(/text-white/);
    expect(out).toMatch(/rounded-lg/);
  });
});

describe('standalone plugin', () => {
  it('unwraps single nested without TW order change among mobiles', async () => {
    const out = await formatStandalone(`import { tv } from 'tailwind-variants'
export const x = tv({ base: ['text-white', ['px-4'], ['py-2', 'rounded-lg']] })
`);
    expect(out).toMatch(/base: \['text-white', 'px-4', \['py-2', 'rounded-lg'\]\]/);
  });
});
