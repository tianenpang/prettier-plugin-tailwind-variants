import { staticStringValue } from './ast-utils.js';
import { splitClasses } from './split-classes.js';
import type { ClassArrayNode, ClassifyOptions, EstreeNode, FixedArray, Mobile } from './types.js';

const BLANK_RE = /^\s*$/;

export const isBlankClassString = (str: string): boolean => {
  return BLANK_RE.test(str);
};

export const classifyClassArrayElement = (
  node: EstreeNode | null | undefined,
  opts: ClassifyOptions = {}
): ClassArrayNode | null => {
  const unwrapSingle = opts.unwrapSingleClassArrays !== false;

  if (!node) {
    return null;
  }

  const str = staticStringValue(node);

  if (str !== null) {
    if (BLANK_RE.test(str)) {
      return { type: 'drop' };
    }

    const tokens = splitClasses(str);

    if (tokens.length === 0) {
      return { type: 'drop' };
    }

    if (tokens.length === 1) {
      return { type: 'mobile', token: tokens[0]! };
    }

    return { type: 'fixed-string', tokens };
  }

  if (node.type === 'ArrayExpression') {
    const children: ClassArrayNode[] = [];
    const elements = node.elements as Array<EstreeNode | null>;

    for (const el of elements) {
      if (el === null) {
        return null;
      }

      const child = classifyClassArrayElement(el, opts);

      if (!child) {
        return null;
      }

      if (child.type !== 'drop') {
        children.push(child);
      }
    }

    if (children.length === 0) {
      return { type: 'drop' };
    }

    if (unwrapSingle && children.length === 1 && children[0]!.type === 'mobile') {
      return children[0]!;
    }

    return { type: 'fixed-array', children };
  }

  return null;
};

export const classifyClassArrayElements = (
  elementNodes: Array<EstreeNode | null>,
  opts: ClassifyOptions = {}
): ClassArrayNode[] | null => {
  const out: ClassArrayNode[] = [];

  for (const el of elementNodes) {
    if (el === null) {
      return null;
    }

    const node = classifyClassArrayElement(el, opts);

    if (!node) {
      return null;
    }

    if (node.type !== 'drop') {
      out.push(node);
    }
  }

  return out;
};

const collectSortJobs = (nodes: ClassArrayNode[], out: string[][]): void => {
  const mobileTokens: string[] = [];

  for (const node of nodes) {
    if (node.type === 'fixed-string' && node.tokens.length > 1) {
      out.push(node.tokens);
    } else if (node.type === 'fixed-array') {
      collectSortJobs(node.children, out);
    } else if (node.type === 'mobile') {
      mobileTokens.push(node.token);
    }
  }

  if (mobileTokens.length > 1) {
    out.push(mobileTokens);
  }
};

const applySortJobs = (
  nodes: ClassArrayNode[],
  sortedGroups: string[][],
  cursor: { i: number }
): ClassArrayNode[] => {
  const prepared: ClassArrayNode[] = [];
  const mobiles: Mobile[] = [];

  for (const node of nodes) {
    if (node.type === 'drop') {
      continue;
    }

    if (node.type === 'fixed-string') {
      const tokens = node.tokens.filter((t) => t.length > 0);

      if (tokens.length === 0) {
        continue;
      }

      if (tokens.length === 1) {
        const mobile: Mobile = { type: 'mobile', token: tokens[0]! };
        prepared.push(mobile);
        mobiles.push(mobile);
      } else {
        const sorted = sortedGroups[cursor.i++] ?? tokens;
        prepared.push({ type: 'fixed-string', tokens: sorted });
      }
      continue;
    }

    if (node.type === 'fixed-array') {
      const nested = applySortJobs(node.children, sortedGroups, cursor);

      if (nested.length === 0) {
        continue;
      }

      prepared.push({ type: 'fixed-array', children: nested } satisfies FixedArray);
      continue;
    }

    // Remaining nodes are mobiles after drop / fixed-* branches above
    if (node.token.length === 0) {
      continue;
    }

    prepared.push(node);
    mobiles.push(node);
  }

  if (mobiles.length > 1) {
    const sortedMobiles = sortedGroups[cursor.i++] ?? mobiles.map((m) => m.token);
    let mi = 0;

    for (let i = 0; i < prepared.length; i++) {
      if (prepared[i]!.type === 'mobile') {
        prepared[i] = {
          type: 'mobile',
          token: sortedMobiles[mi++] ?? (prepared[i] as Mobile).token
        };
      }
    }
  }

  return prepared;
};

export const collectClassArraySortJobs = (
  nodes: ClassArrayNode[],
  out: string[][] = []
): string[][] => {
  collectSortJobs(nodes, out);
  return out;
};

export const applyClassArraySortJobs = (
  nodes: ClassArrayNode[],
  sortedGroups: string[][]
): ClassArrayNode[] => {
  return applySortJobs(nodes, sortedGroups, { i: 0 });
};

export const serializeClassArrayNodes = (nodes: ClassArrayNode[], quote: string): string => {
  if (nodes.length === 0) {
    return '[]';
  }

  let out = '[';

  for (let i = 0; i < nodes.length; i++) {
    if (i > 0) {
      out += ', ';
    }

    out += serializeNode(nodes[i]!, quote);
  }

  return out + ']';
};

const serializeNode = (node: ClassArrayNode, quote: string): string => {
  if (node.type === 'mobile') {
    return q(node.token, quote);
  }

  if (node.type === 'fixed-string') {
    return q(node.tokens.join(' '), quote);
  }

  if (node.type === 'drop') {
    return '';
  }

  return serializeClassArrayNodes(node.children, quote);
};

const q = (value: string, quote: string): string => {
  if (quote === "'") {
    return "'" + value.replace(/\\/g, '\\\\').replace(/'/g, "\\'") + "'";
  }

  return '"' + value.replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"';
};

export const sameArraySource = (a: string, b: string): boolean => {
  return a.replace(/\s+/g, ' ').trim() === b.replace(/\s+/g, ' ').trim();
};
