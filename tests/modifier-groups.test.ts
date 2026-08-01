import { describe, expect, it } from 'vitest';
import { buildGroupedStrings, classifyClass } from '../src/classify-class.js';
import { expandBuiltinGroupOrder, resolveModifierGroupOrder } from '../src/modifier-groups.js';

describe('classifyClass', () => {
  it('classifies base and common modifiers', () => {
    expect(classifyClass('px-4')).toBe('base');
    expect(classifyClass('hover:bg-red-500')).toBe('hover');
    expect(classifyClass('dark:bg-black')).toBe('dark');
    expect(classifyClass('sm:px-4')).toBe('responsive');
  });

  it('uses first segment for stacked variants', () => {
    expect(classifyClass('sm:hover:bg-red-500', true)).toBe('sm');
    expect(classifyClass('hover:sm:bg-red-500', true)).toBe('hover');
  });

  it('splits breakpoints when enabled', () => {
    expect(classifyClass('md:px-8', true)).toBe('md');
    expect(classifyClass('max-sm:px-2', true)).toBe('max-sm');
  });
});

describe('resolveModifierGroupOrder', () => {
  it('returns builtin order by default', () => {
    const order = resolveModifierGroupOrder(undefined, false);
    expect(order[0]).toBe('base');
    expect(order).toContain('responsive');
    expect(order.indexOf('dark')).toBeLessThan(order.indexOf('responsive'));
  });

  it('expands breakpoints when grouping by breakpoint', () => {
    const order = expandBuiltinGroupOrder(true);
    expect(order).toContain('sm');
    expect(order).toContain('md');
    expect(order).not.toContain('responsive');
  });

  it('ignores unknown ids, dedupes, and fills missing', () => {
    const order = resolveModifierGroupOrder(['not-real', 'hover', 'hover', 'base'], false);
    expect(order[0]).toBe('hover');
    expect(order[1]).toBe('base');
    expect(order).toContain('dark');
    expect(order).not.toContain('not-real');
  });

  it('expands responsive in user order when splitting breakpoints', () => {
    const order = resolveModifierGroupOrder(['base', 'responsive', 'hover'], true);
    expect(order.indexOf('sm')).toBeGreaterThan(order.indexOf('base'));
    expect(order).toContain('md');
    expect(order).not.toContain('responsive');
  });
});

describe('buildGroupedStrings', () => {
  it('omits empty buckets and joins tokens', () => {
    const order = resolveModifierGroupOrder(undefined, false);
    const out = buildGroupedStrings(
      ['px-4', 'hover:bg-red-500', 'py-2', 'dark:bg-black'],
      order,
      false
    );
    expect(out).toEqual(['px-4 py-2', 'hover:bg-red-500', 'dark:bg-black']);
  });

  it('returns a single string worth of one bucket', () => {
    const order = resolveModifierGroupOrder(undefined, false);
    const out = buildGroupedStrings(['py-2', 'px-4'], order, false);
    expect(out).toEqual(['py-2 px-4']);
  });

  it('inserts multiple unknown breakpoint groups in ascending sorted order', () => {
    const order = resolveModifierGroupOrder(undefined, true);
    const out = buildGroupedStrings(
      ['px-4', 'max-lg:px-8', 'max-sm:px-2', 'hover:bg-red-500'],
      order,
      true
    );
    expect(out).toEqual(['px-4', 'hover:bg-red-500', 'max-lg:px-8', 'max-sm:px-2']);
  });
});
