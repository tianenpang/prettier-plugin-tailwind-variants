import type { EstreeNode, EstreeObjectExpression, EstreeProperty, PluginOptions } from './types.js';

const SKIP_KEYS = new Set([
  'loc',
  'range',
  'start',
  'end',
  'tokens',
  'comments',
  'errors',
  'extra'
]);

export const getTvFunctionNames = (options: PluginOptions): Set<string> => {
  let list = options.tvFunctions;

  if (!Array.isArray(list)) {
    list = ['tv'];
  }

  return new Set(list.filter((x): x is string => typeof x === 'string' && x.length > 0));
};

export const stringLiteralValue = (node: EstreeNode | null | undefined): string | null => {
  if (!node) {
    return null;
  }

  if (
    node.type === 'Literal' &&
    typeof node.value === 'string' &&
    !('regex' in node && node.regex)
  ) {
    return node.value;
  }

  if (node.type === 'StringLiteral' && typeof node.value === 'string') {
    return node.value;
  }

  return null;
};

/**
 * Static string-like values we may rewrite:
 * - string literals
 * - template literals with no substitutions (`` `foo` ``)
 *
 * Dynamic templates (`` `foo-${x}` ``) return null.
 */
export const staticStringValue = (node: EstreeNode | null | undefined): string | null => {
  const literal = stringLiteralValue(node);

  if (literal !== null) {
    return literal;
  }

  if (!node || node.type !== 'TemplateLiteral') {
    return null;
  }

  const expressions = node.expressions;

  if (Array.isArray(expressions) && expressions.length > 0) {
    return null;
  }

  const quasis = node.quasis;

  if (!Array.isArray(quasis) || quasis.length === 0) {
    return null;
  }

  // No expressions ⇒ a single cooked quasi holds the full string.
  const cooked = (quasis[0] as { value?: { cooked?: string | null } } | undefined)?.value?.cooked;

  return typeof cooked === 'string' ? cooked : null;
};

export const walkNode = (
  node: EstreeNode | null | undefined,
  fn: (node: EstreeNode) => void
): void => {
  if (!node || typeof node !== 'object') {
    return;
  }

  if (!('type' in node)) {
    return;
  }

  fn(node);

  for (const key of Object.keys(node)) {
    if (SKIP_KEYS.has(key)) {
      continue;
    }

    const v = node[key];

    if (Array.isArray(v)) {
      for (const item of v) {
        walkNode(item as EstreeNode, fn);
      }
    } else if (v && typeof v === 'object' && 'type' in v) {
      walkNode(v as EstreeNode, fn);
    }
  }
};

export const isObjectProperty = (prop: EstreeNode | null | undefined): prop is EstreeProperty => {
  return Boolean(prop && (prop.type === 'Property' || prop.type === 'ObjectProperty'));
};

export const propertyKeyName = (prop: EstreeNode | null | undefined): string | null => {
  if (!isObjectProperty(prop) || prop.computed) {
    return null;
  }

  const key = prop.key;

  if (key.type === 'Identifier' && typeof key.name === 'string') {
    return key.name;
  }

  if (key.type === 'Literal' && typeof key.value === 'string') {
    return key.value;
  }

  return null;
};

export const findProperty = (
  objectExpr: EstreeNode | null | undefined,
  name: string
): EstreeProperty | null => {
  if (!objectExpr || objectExpr.type !== 'ObjectExpression') {
    return null;
  }

  for (const prop of (objectExpr as EstreeObjectExpression).properties) {
    if (propertyKeyName(prop) === name && isObjectProperty(prop)) {
      return prop;
    }
  }

  return null;
};

export const nodeRange = (node: {
  start?: number;
  end?: number;
  range?: [number, number];
}): { start: number; end: number } | null => {
  const start = node.start ?? node.range?.[0];
  const end = node.end ?? node.range?.[1];

  if (typeof start !== 'number' || typeof end !== 'number') {
    return null;
  }

  return { start, end };
};

export const containsNode = (
  parent: { start?: number; end?: number; range?: [number, number] },
  child: { start?: number; end?: number; range?: [number, number] }
): boolean => {
  const p = nodeRange(parent);
  const c = nodeRange(child);

  if (!p || !c) {
    return false;
  }

  return c.start >= p.start && c.end <= p.end;
};
