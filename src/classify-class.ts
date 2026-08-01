import { splitVariantSegments } from './split-classes.js';

const BREAKPOINTS = new Set([
  'sm',
  'md',
  'lg',
  'xl',
  '2xl',
  '3xl',
  '4xl',
  '5xl',
  '6xl',
  '7xl',
  '8xl'
]);

const PREFIX_RULES: Array<[string, string]> = (
  [
    ['placeholder-shown', 'placeholder-shown'],
    ['focus-visible', 'focus-visible'],
    ['in-range', 'in-range'],
    ['out-of-range', 'out-of-range'],
    ['read-only', 'read-only'],
    ['motion-safe', 'motion-safe'],
    ['motion-reduce', 'motion-reduce'],
    ['contrast-more', 'contrast-more'],
    ['contrast-less', 'contrast-less'],
    ['indeterminate', 'indeterminate'],
    ['placeholder', 'placeholder'],
    ['autofill', 'autofill'],
    ['landscape', 'landscape'],
    ['portrait', 'portrait'],
    ['pagination', 'pagination'],
    ['selected', 'selected'],
    ['required', 'required'],
    ['invalid', 'invalid'],
    ['default', 'default'],
    ['disabled', 'disabled'],
    ['enabled', 'enabled'],
    ['checked', 'checked'],
    ['pressed', 'pressed'],
    ['empty', 'empty'],
    ['only', 'only'],
    ['odd', 'odd'],
    ['even', 'even'],
    ['first', 'first'],
    ['last', 'last'],
    ['open', 'open'],
    ['closed', 'closed'],
    ['valid', 'valid'],
    ['before', 'before'],
    ['after', 'after'],
    ['print', 'print'],
    ['file', 'file'],
    ['dark', 'dark'],
    ['rtl', 'rtl'],
    ['ltr', 'ltr'],
    ['hover', 'hover'],
    ['focus', 'focus'],
    ['active', 'active']
  ] as Array<[string, string]>
).sort((a, b) => b[0].length - a[0].length);

const isResponsiveVariant = (seg: string): boolean => {
  if (BREAKPOINTS.has(seg)) {
    return true;
  }

  return seg.startsWith('max-') || seg.startsWith('min-');
};

/**
 * Classify a single class token into a modifier group id.
 * When `groupByBreakpoints`, responsive tokens use the first segment as the bucket id.
 */
export const classifyClass = (className: string, groupByBreakpoints = false): string => {
  const segments = splitVariantSegments(className.trim());

  if (segments.length <= 1) {
    return 'base';
  }

  const first = segments[0];

  if (!first) {
    return 'base';
  }

  if (isResponsiveVariant(first)) {
    return groupByBreakpoints ? first : 'responsive';
  }

  if (first.startsWith('@')) {
    return first.includes('[') ? 'supports-arbitrary' : 'supports';
  }

  if (first.startsWith('supports-')) {
    return first.includes('[') ? 'supports-arbitrary' : 'supports';
  }

  if (first.startsWith('group-has')) {
    return 'group-has';
  }

  if (first === 'peer' || first.startsWith('peer-')) {
    return 'peer';
  }

  if (first === 'has' || first.startsWith('has-')) {
    return 'has';
  }

  if (first === 'not' || first.startsWith('not-')) {
    return 'not';
  }

  if (first.startsWith('aria-') || first === 'aria') {
    return 'aria';
  }

  if (first.startsWith('data-') || first === 'data') {
    return 'data';
  }

  for (const [prefix, group] of PREFIX_RULES) {
    if (first === prefix || first.startsWith(`${prefix}-`)) {
      return group;
    }
  }

  return 'other';
};

/**
 * Bucket sorted tokens into one string per non-empty group, in `order`.
 * Extra bucket ids (e.g. `max-sm`) not in `order` are inserted before `other`.
 */
export const buildGroupedStrings = (
  classTokens: string[],
  order: string[],
  groupByBreakpoints = false
): string[] => {
  const buckets = new Map<string, string[]>();

  for (const id of order) {
    buckets.set(id, []);
  }

  const extras = new Set<string>();

  for (const tok of classTokens) {
    if (!tok.trim()) {
      continue;
    }

    const g = classifyClass(tok, groupByBreakpoints);

    if (!buckets.has(g)) {
      buckets.set(g, []);
      extras.add(g);
    }

    buckets.get(g)!.push(tok);
  }

  const finalOrder = [...order];
  const orderSet = new Set(order);
  const extraIds = [...extras].sort((a, b) => a.localeCompare(b));

  for (const id of extraIds) {
    if (orderSet.has(id)) {
      continue;
    }

    // Prefer placing unknown breakpoint-like ids after standard screens / before supports
    const otherIdx = finalOrder.indexOf('other');
    const supportsIdx = finalOrder.indexOf('supports');
    const insertAt = supportsIdx >= 0 ? supportsIdx : otherIdx >= 0 ? otherIdx : finalOrder.length;

    finalOrder.splice(insertAt, 0, id);
    orderSet.add(id);
  }

  const out: string[] = [];

  for (const id of finalOrder) {
    const list = buckets.get(id);

    if (list && list.length > 0) {
      out.push(list.join(' '));
    }
  }

  return out;
};
