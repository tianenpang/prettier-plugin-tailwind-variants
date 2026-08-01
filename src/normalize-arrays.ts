import {
  applyClassArraySortJobs,
  classifyClassArrayElements,
  collectClassArraySortJobs,
  countBlankLeaves,
  flattenClassArrayTokens,
  q,
  sameSource,
  serializeClassArrayNodes
} from './array-structure.js';
import { buildGroupedStrings } from './classify-class.js';
import { containsNode, getTvFunctionNames, nodeRange } from './ast-utils.js';
import { resolveModifierGroupOrder } from './modifier-groups.js';
import { sortClassTokenGroups } from './sort-classes.js';
import { splitClasses } from './split-classes.js';
import type {
  ClassArrayNode,
  EstreeArrayExpression,
  EstreeNode,
  LocatedNode,
  PluginOptions,
  ShapeMode,
  TextEdit
} from './types.js';
import { collectTvClassTargets } from './visit-tv.js';

interface ArrayWorkItem {
  kind: 'array';
  start: number;
  end: number;
  classified: ClassArrayNode[];
  quote: string;
  current: string;
}

interface StringWorkItem {
  kind: 'string';
  start: number;
  end: number;
  tokens: string[];
  quote: string;
  current: string;
}

type WorkItem = ArrayWorkItem | StringWorkItem;

export const resolveShapeMode = (options: PluginOptions): ShapeMode => {
  if (options.tvGroupByModifiers === true) {
    return 'group';
  }

  if (options.tvFlattenToString === true) {
    return 'flatten';
  }

  return 'structure';
};

/**
 * Structure-preserving / flatten / modifier-group edits for TV class values.
 */
export const collectArrayNormalizeEdits = async (
  ast: EstreeNode,
  options: PluginOptions,
  originalText: string,
  tailwindPlugin?: unknown
): Promise<TextEdit[]> => {
  const shape = resolveShapeMode(options);
  const removeEmpty = options.tvRemoveEmptyClasses !== false;
  const groupByBreakpoints = options.tvGroupByBreakpoints === true;
  const groupOrder =
    shape === 'group'
      ? resolveModifierGroupOrder(options.tvModifierGroupOrder, groupByBreakpoints)
      : null;

  const { arrayNodes, blankStringNodes, staticStringNodes } = collectTvClassTargets(ast, options);

  if (arrayNodes.length === 0 && blankStringNodes.length === 0 && staticStringNodes.length === 0) {
    return [];
  }

  // Only transform top-most class arrays. Nested arrays serialize with parent.
  const topLevel =
    arrayNodes.length <= 1
      ? arrayNodes
      : arrayNodes.filter((node, i) => {
          for (let j = 0; j < arrayNodes.length; j++) {
            if (j !== i && containsNode(arrayNodes[j]!, node)) {
              return false;
            }
          }
          return true;
        });

  const unwrap = shape === 'structure' ? options.tvUnwrapSingleClassArrays !== false : false;

  const work: WorkItem[] = [];

  for (const arrayNode of topLevel) {
    const range = nodeRange(arrayNode);

    if (!range) {
      continue;
    }

    const classified = classifyClassArrayElements((arrayNode as EstreeArrayExpression).elements, {
      unwrapSingleClassArrays: unwrap,
      removeEmptyClasses: removeEmpty
    });

    if (!classified) {
      continue;
    }

    work.push({
      kind: 'array',
      start: range.start,
      end: range.end,
      classified,
      quote: pickQuote(originalText, range.start, range.end),
      current: originalText.slice(range.start, range.end)
    });
  }

  if (shape === 'group' || shape === 'flatten') {
    for (const { node, value } of staticStringNodes) {
      if (topLevel.some((arrayNode) => containsNode(arrayNode, node))) {
        continue;
      }

      const range = nodeRange(node);

      if (!range) {
        continue;
      }

      work.push({
        kind: 'string',
        start: range.start,
        end: range.end,
        tokens: splitClasses(value),
        quote: originalText[range.start] === '"' ? '"' : "'",
        current: originalText.slice(range.start, range.end)
      });
    }
  }

  const tokenJobs: string[][] = [];
  /** For structure mode: start index into tokenJobs for each work item. */
  const structureOffsets: number[] = [];
  /** For flatten/group: work index → tokenJobs index (or -1 if no sort job). */
  const flatJobIndex = new Map<number, number>();

  for (let w = 0; w < work.length; w++) {
    const item = work[w]!;

    if (shape === 'structure' && item.kind === 'array') {
      structureOffsets[w] = tokenJobs.length;
      collectClassArraySortJobs(item.classified, tokenJobs);
      continue;
    }

    structureOffsets[w] = -1;

    const tokens =
      item.kind === 'array' ? flattenClassArrayTokens(item.classified) : [...item.tokens];

    if (tokens.length === 0) {
      flatJobIndex.set(w, -1);
      continue;
    }

    flatJobIndex.set(w, tokenJobs.length);
    tokenJobs.push(tokens);
  }

  const sortedAll =
    tokenJobs.length === 0 ? [] : await sortClassTokenGroups(tokenJobs, options, tailwindPlugin);

  const edits: TextEdit[] = [];

  for (let w = 0; w < work.length; w++) {
    const item = work[w]!;
    let replacement: string | null = null;

    if (shape === 'structure' && item.kind === 'array') {
      const offset = structureOffsets[w]!;
      let nextOffset = tokenJobs.length;

      for (let n = w + 1; n < work.length; n++) {
        if (structureOffsets[n]! >= 0) {
          nextOffset = structureOffsets[n]!;
          break;
        }
      }

      const groups = sortedAll.slice(offset, nextOffset);
      const normalized = applyClassArraySortJobs(item.classified, groups);
      replacement = serializeClassArrayNodes(normalized, item.quote);
    } else if (shape === 'flatten') {
      const idx = flatJobIndex.get(w);
      const tokens = idx !== undefined && idx >= 0 ? (sortedAll[idx] ?? []) : [];
      const blankCount = item.kind === 'array' ? countBlankLeaves(item.classified) : 0;
      replacement = serializeFlatString(tokens, item.quote, removeEmpty, item, blankCount);
    } else if (shape === 'group' && groupOrder) {
      const idx = flatJobIndex.get(w);
      const tokens = idx !== undefined && idx >= 0 ? (sortedAll[idx] ?? []) : [];
      const grouped = buildGroupedStrings(tokens, groupOrder, groupByBreakpoints);
      const blankCount = item.kind === 'array' ? countBlankLeaves(item.classified) : 0;
      replacement = serializeGrouped(grouped, item.quote, removeEmpty, item, blankCount);
    }

    if (replacement !== null && !sameSource(item.current, replacement)) {
      edits.push({ start: item.start, end: item.end, replacement });
    }
  }

  // Blank string leaves (structure / always when removeEmpty)
  for (const stringNode of blankStringNodes) {
    if (topLevel.some((arrayNode) => containsNode(arrayNode, stringNode))) {
      continue;
    }

    if (!removeEmpty) {
      continue;
    }

    const range = nodeRange(stringNode);

    if (!range) {
      continue;
    }

    const current = originalText.slice(range.start, range.end);
    const quote = current.startsWith('"') ? '"' : "'";
    const replacement = quote + quote;

    if (current !== replacement) {
      edits.push({ start: range.start, end: range.end, replacement });
    }
  }

  return edits;
};

const serializeFlatString = (
  tokens: string[],
  quote: string,
  removeEmpty: boolean,
  item: WorkItem,
  blankCount: number
): string => {
  if (tokens.length === 0) {
    if (!removeEmpty && item.kind === 'array') {
      return serializeClassArrayNodes(item.classified, quote);
    }

    return quote + quote;
  }

  // Flatten is a single string — blank placeholders cannot be represented mid-string.
  // When blanks must be kept, emit `[joined, '', …]` instead of losing them.
  if (!removeEmpty && blankCount > 0) {
    const parts = [tokens.join(' '), ...Array.from({ length: blankCount }, () => '')];
    return '[' + parts.map((p) => q(p, quote)).join(', ') + ']';
  }

  return q(tokens.join(' '), quote);
};

const serializeGrouped = (
  groups: string[],
  quote: string,
  removeEmpty: boolean,
  item: WorkItem,
  blankCount: number
): string => {
  if (groups.length === 0) {
    if (!removeEmpty && item.kind === 'array') {
      return serializeClassArrayNodes(item.classified, quote);
    }

    return quote + quote;
  }

  const parts = [...groups];

  if (!removeEmpty && blankCount > 0) {
    for (let i = 0; i < blankCount; i++) {
      parts.push('');
    }
  }

  if (parts.length === 1) {
    return q(parts[0]!, quote);
  }

  return '[' + parts.map((g) => q(g, quote)).join(', ') + ']';
};

export const applyEdits = (text: string, edits: TextEdit[]): string => {
  if (!edits.length) {
    return text;
  }

  const ordered = [...edits].sort((a, b) => b.start - a.start);
  let out = text;

  for (const edit of ordered) {
    out = out.slice(0, edit.start) + edit.replacement + out.slice(edit.end);
  }

  return out;
};

const pickQuote = (text: string, start: number, end: number): string => {
  const slice = text.slice(start, end);

  if (slice.includes("'") && !slice.includes('"')) {
    return '"';
  }

  return "'";
};

export const mayContainTvCall = (text: string, options: PluginOptions): boolean => {
  const names = getTvFunctionNames(options);

  if (names.size === 0) {
    return false;
  }

  for (const name of names) {
    if (text.includes(name + '(') || text.includes(name + ' (')) {
      return true;
    }
  }

  return false;
};

/**
 * Cheap gate before the core parse / double-parse path.
 */
export const mayNeedTvTransform = (text: string, options: PluginOptions): boolean => {
  if (!mayContainTvCall(text, options)) {
    return false;
  }

  if (options.tvGroupByModifiers === true || options.tvFlattenToString === true) {
    return true;
  }

  // Array class values (the main job of this plugin)
  if (text.includes('[')) {
    return true;
  }

  // Whitespace-only class strings in source: '' / '   ' / '\t' / `  `
  if (/:\s*(['"`])(?:\s|\\[nrtvfr])*\1/.test(text)) {
    return true;
  }

  return false;
};

// Re-export for tests
export type { LocatedNode };
