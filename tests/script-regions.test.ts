import { describe, expect, it } from 'vitest';
import { getTransformRegions } from '../src/script-regions.js';

describe('getTransformRegions', () => {
  it('returns the whole file for typescript', () => {
    const text = "export const x = tv({ base: ['a'] })\n";
    const regions = getTransformRegions(text, 'typescript');
    expect(regions).toHaveLength(1);
    expect(regions[0]).toMatchObject({ start: 0, end: text.length, content: text });
  });

  it('extracts vue script setup lang=ts', () => {
    const text = `<template><div /></template>
<script setup lang="ts">
import { tv } from 'tailwind-variants'
const button = tv({ base: ['text-white', 'px-4'] })
</script>
`;
    const regions = getTransformRegions(text, 'vue');
    expect(regions).toHaveLength(1);
    expect(regions[0]!.coreParser).toBe('typescript');
    expect(regions[0]!.content).toContain('tv({ base:');
    expect(text.slice(regions[0]!.start, regions[0]!.end)).toBe(regions[0]!.content);
  });

  it('extracts multiple script blocks', () => {
    const text = `<script lang="ts">
export const shared = 1
</script>
<script setup lang="ts">
const x = tv({ base: ['a', 'b'] })
</script>
`;
    const regions = getTransformRegions(text, 'vue');
    expect(regions).toHaveLength(2);
    expect(regions[1]!.content).toContain('tv(');
  });

  it('skips external script src', () => {
    const text = `<script src="./app.js"></script>
<script>
const x = tv({ base: ['a'] })
</script>
`;
    const regions = getTransformRegions(text, 'html');
    expect(regions).toHaveLength(1);
    expect(regions[0]!.content).toContain('tv(');
  });

  it('extracts astro frontmatter', () => {
    const text = `---
import { tv } from 'tailwind-variants'
const box = tv({ base: ['p-2', 'm-1'] })
---
<div />
`;
    const regions = getTransformRegions(text, 'astro');
    expect(regions.some((r) => r.content.includes('tv('))).toBe(true);
  });
});
