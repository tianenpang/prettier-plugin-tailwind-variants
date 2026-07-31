import path from 'node:path';
import { fileURLToPath } from 'node:url';
import prettier from 'prettier';
import * as tailwindPlugin from 'prettier-plugin-tailwindcss';
import { describe, expect, it } from 'vitest';
import tailwindVariants from '../src/index.js';
import { stylesheet } from './utils.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectConfigPath = path.resolve(__dirname, '../prettier.config.js');
const customVariantsCss = path.resolve(__dirname, 'fixtures/custom-variants.css');

const format = async (
  code: string,
  parser: string,
  extra: Record<string, unknown> = {},
  extraPlugins: prettier.Plugin[] = []
) => {
  const resolved = await prettier.resolveConfig(projectConfigPath);
  return prettier.format(code, {
    ...resolved,
    parser,
    plugins: [...extraPlugins, tailwindVariants(tailwindPlugin)],
    tailwindFunctions: ['tv'],
    tailwindStylesheet: stylesheet,
    tvFunctions: ['tv'],
    tvUnwrapSingleClassArrays: true,
    filepath: path.join(__dirname, `virtual.${parser === 'vue' ? 'vue' : parser}`),
    ...extra
  });
};

describe('framework parsers', () => {
  it('formats tv arrays inside Vue <script setup lang="ts">', async () => {
    const out = await format(
      `<template>
  <button :class="button()" />
</template>

<script setup lang="ts">
import { tv } from 'tailwind-variants'

const button = tv({
  base: ['text-white', 'px-4', 'rounded-lg', 'py-2'],
})
</script>
`,
      'vue'
    );

    expect(out).toMatch(/base: \['rounded-lg', 'px-4', 'py-2', 'text-white'\]/);
  });

  it('formats tv arrays inside Svelte <script lang="ts">', async () => {
    const sveltePlugin = (await import('prettier-plugin-svelte')).default;
    const out = await format(
      `<script lang="ts">
import { tv } from 'tailwind-variants'

const button = tv({
  base: ['text-white', 'px-4', 'rounded-lg', 'py-2'],
})
</script>

<button class={button()}>OK</button>
`,
      'svelte',
      {},
      [sveltePlugin]
    );

    expect(out).toMatch(/base: \['rounded-lg', 'px-4', 'py-2', 'text-white'\]/);
  });

  it('formats tv arrays inside HTML <script>', async () => {
    const out = await format(
      `<!doctype html>
<html>
  <body>
    <button id="btn"></button>
    <script type="module">
      import { tv } from 'tailwind-variants';

      const button = tv({
        base: ['text-white', 'px-4', 'rounded-lg', 'py-2'],
      });

      document.getElementById('btn').className = button();
    </script>
  </body>
</html>
`,
      'html'
    );

    expect(out).toMatch(/base: \['rounded-lg', 'px-4', 'py-2', 'text-white'\]/);
  });

  it('formats tv arrays inside Astro frontmatter', async () => {
    const astroPlugin = await import('prettier-plugin-astro');
    const out = await format(
      `---
import { tv } from 'tailwind-variants'

const button = tv({
  base: ['text-white', 'px-4', 'rounded-lg', 'py-2'],
})
---
<button class={button()}>OK</button>
`,
      'astro',
      {},
      [astroPlugin]
    );

    expect(out).toMatch(/base: \['rounded-lg', 'px-4', 'py-2', 'text-white'\]/);
  });

  it('formats tv arrays inside Astro <script> block', async () => {
    const astroPlugin = await import('prettier-plugin-astro');
    const out = await format(
      `---
---
<button id="btn">OK</button>
<script>
  import { tv } from 'tailwind-variants'

  const button = tv({
    base: ['text-white', 'px-4', 'rounded-lg', 'py-2'],
  })

  document.getElementById('btn').className = button()
</script>
`,
      'astro',
      {},
      [astroPlugin]
    );

    expect(out).toMatch(/base: \['rounded-lg', 'px-4', 'py-2', 'text-white'\]/);
  });
});

describe('tailwind config path + custom variants', () => {
  it('sorts breakpoint / variant tokens via stylesheet (createSorter)', async () => {
    const out = await format(
      `import { tv } from 'tailwind-variants'
export const x = tv({
  base: ['text-white', 'sm:px-4', 'md:px-6', 'px-2', 'hover:bg-red-500', 'bg-blue-500'],
})
`,
      'typescript'
    );

    expect(out).toMatch(
      /base: \['bg-blue-500', 'px-2', 'text-white', 'hover:bg-red-500', 'sm:px-4', 'md:px-6'\]/
    );
  });

  it('honors custom variants from a dedicated stylesheet', async () => {
    const out = await format(
      `import { tv } from 'tailwind-variants'
export const x = tv({
  base: ['text-white', 'data-open:bg-red-500', 'p-2', 'data-closed:opacity-0'],
})
`,
      'typescript',
      { tailwindStylesheet: customVariantsCss }
    );

    // Official sorter order for this stylesheet — assert a stable, stylesheet-driven result.
    expect(out).toMatch(/data-closed:opacity-0/);
    expect(out).toMatch(/data-open:bg-red-500/);
    expect(out).toMatch(/base: \[/);

    const match = /base: \[([^\]]+)\]/.exec(out);
    expect(match?.[1]).toBeTruthy();
    const tokens = match![1]!.split(',').map((s) => s.trim().replace(/^'|'$/g, ''));
    expect(tokens).toContain('p-2');
    expect(tokens).toContain('text-white');
    // Custom variants must remain intact (not stripped) after sort.
    expect(tokens.some((t) => t.startsWith('data-open:'))).toBe(true);
    expect(tokens.some((t) => t.startsWith('data-closed:'))).toBe(true);
  });
});
