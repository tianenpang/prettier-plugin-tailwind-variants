/** Standard Tailwind screens (mobile-first). */
export const STANDARD_BREAKPOINTS = [
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
] as const;

/**
 * Built-in modifier group order (DX / Tailwind mental model):
 * base → interaction → structural → relational → theme → responsive → supports → other
 */
export const DEFAULT_MODIFIER_GROUP_ORDER: readonly string[] = [
  'base',
  'hover',
  'focus',
  'focus-visible',
  'active',
  'pressed',
  'disabled',
  'enabled',
  'checked',
  'indeterminate',
  'selected',
  'open',
  'closed',
  'required',
  'valid',
  'invalid',
  'in-range',
  'out-of-range',
  'file',
  'placeholder',
  'placeholder-shown',
  'autofill',
  'read-only',
  'default',
  'empty',
  'first',
  'last',
  'only',
  'odd',
  'even',
  'group-has',
  'peer',
  'has',
  'not',
  'aria',
  'data',
  'before',
  'after',
  'rtl',
  'ltr',
  'portrait',
  'landscape',
  'motion-safe',
  'motion-reduce',
  'contrast-more',
  'contrast-less',
  'print',
  'pagination',
  'dark',
  'responsive',
  'supports',
  'supports-arbitrary',
  'other'
];

const KNOWN_GROUP_IDS = new Set<string>([...DEFAULT_MODIFIER_GROUP_ORDER, ...STANDARD_BREAKPOINTS]);

export const isKnownBreakpointId = (id: string): boolean => {
  if ((STANDARD_BREAKPOINTS as readonly string[]).includes(id)) {
    return true;
  }

  return id.startsWith('max-') || id.startsWith('min-');
};

export const expandBuiltinGroupOrder = (groupByBreakpoints: boolean): string[] => {
  if (!groupByBreakpoints) {
    return [...DEFAULT_MODIFIER_GROUP_ORDER];
  }

  const out: string[] = [];

  for (const id of DEFAULT_MODIFIER_GROUP_ORDER) {
    if (id === 'responsive') {
      out.push(...STANDARD_BREAKPOINTS);
      continue;
    }

    out.push(id);
  }

  return out;
};

/**
 * Resolve effective group order.
 * - Unknown ids ignored
 * - Duplicates: first wins
 * - Missing builtin ids appended in builtin relative order
 * - When groupByBreakpoints: `responsive` in user list expands to standard breakpoints
 */
export const resolveModifierGroupOrder = (
  userOrder: string[] | undefined,
  groupByBreakpoints: boolean
): string[] => {
  const builtin = expandBuiltinGroupOrder(groupByBreakpoints);
  const builtinSet = new Set(builtin);

  if (!Array.isArray(userOrder) || userOrder.length === 0) {
    return builtin;
  }

  const resolved: string[] = [];
  const seen = new Set<string>();

  const pushId = (id: string) => {
    if (seen.has(id)) {
      return;
    }

    seen.add(id);
    resolved.push(id);
  };

  for (const raw of userOrder) {
    if (typeof raw !== 'string' || raw.length === 0) {
      continue;
    }

    if (raw === 'responsive') {
      if (groupByBreakpoints) {
        for (const bp of STANDARD_BREAKPOINTS) {
          pushId(bp);
        }
      } else if (builtinSet.has('responsive')) {
        pushId('responsive');
      }
      continue;
    }

    // Breakpoint ids only valid when splitting breakpoints
    if (isKnownBreakpointId(raw)) {
      if (groupByBreakpoints) {
        pushId(raw);
      }
      continue;
    }

    if (KNOWN_GROUP_IDS.has(raw) || builtinSet.has(raw)) {
      pushId(raw);
    }
  }

  for (const id of builtin) {
    if (!seen.has(id)) {
      resolved.push(id);
    }
  }

  return resolved;
};
