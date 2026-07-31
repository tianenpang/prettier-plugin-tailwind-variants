import {
  applyClassArraySortJobs,
  classifyClassArrayElements,
  collectClassArraySortJobs,
  sameArraySource,
  serializeClassArrayNodes
} from './array-structure.js';
import { containsNode, getTvFunctionNames, nodeRange } from './ast-utils.js';
import { sortClassTokenGroups } from './sort-classes.js';
import type {
  ClassArrayNode,
  EstreeArrayExpression,
  EstreeNode,
  PluginOptions,
  TextEdit
} from './types.js';
import { collectTvClassTargets } from './visit-tv.js';

interface WorkItem {
  start: number;
  end: number;
  classified: ClassArrayNode[];
  quote: string;
  current: string;
}

/**
 * Structure-preserving array edits:
 * - string format unchanged (handled by Tailwind plugin)
 * - array stays array; nested single-class arrays unwrap when tvUnwrapSingleClassArrays
 * - multi-class slots keep index; inner classes sorted
 */
export const collectArrayNormalizeEdits = async (
  ast: EstreeNode,
  options: PluginOptions,
  originalText: string,
  tailwindPlugin?: unknown
): Promise<TextEdit[]> => {
  const { arrayNodes, blankStringNodes } = collectTvClassTargets(ast, options);

  if (arrayNodes.length === 0 && blankStringNodes.length === 0) {
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

  const work: WorkItem[] = [];

  for (const arrayNode of topLevel) {
    const range = nodeRange(arrayNode);

    if (!range) {
      continue;
    }

    const classified = classifyClassArrayElements((arrayNode as EstreeArrayExpression).elements, {
      unwrapSingleClassArrays: options.tvUnwrapSingleClassArrays !== false
    });

    if (!classified) {
      continue;
    }

    work.push({
      start: range.start,
      end: range.end,
      classified,
      quote: pickQuote(originalText, range.start, range.end),
      current: originalText.slice(range.start, range.end)
    });
  }

  const allJobs: string[][] = [];
  const jobOffsets: number[] = [];

  for (const item of work) {
    jobOffsets.push(allJobs.length);
    collectClassArraySortJobs(item.classified, allJobs);
  }

  const sortedAll =
    allJobs.length === 0 ? [] : await sortClassTokenGroups(allJobs, options, tailwindPlugin);

  const edits: TextEdit[] = [];

  for (let w = 0; w < work.length; w++) {
    const item = work[w]!;
    const offset = jobOffsets[w]!;
    const nextOffset = w + 1 < work.length ? jobOffsets[w + 1]! : sortedAll.length;
    const normalized = applyClassArraySortJobs(
      item.classified,
      sortedAll.slice(offset, nextOffset)
    );
    const replacement = serializeClassArrayNodes(normalized, item.quote);

    if (!sameArraySource(item.current, replacement)) {
      edits.push({ start: item.start, end: item.end, replacement });
    }
  }

  for (const stringNode of blankStringNodes) {
    if (topLevel.some((arrayNode) => containsNode(arrayNode, stringNode))) {
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
 * String-only `tv({ base: '…' })` is handled by Tailwind — we only need a pre-pass when
 * there are arrays to normalize, static templates in arrays, or blank class strings.
 */
export const mayNeedTvTransform = (text: string, options: PluginOptions): boolean => {
  if (!mayContainTvCall(text, options)) {
    return false;
  }

  // Array class values (the main job of this plugin)
  if (text.includes('[')) {
    return true;
  }

  // Whitespace-only class strings in source: '' / '   ' / '\t' / `  `
  // (false positives only cost a cheap core parse — still skip pure utility strings)
  if (/:\s*(['"`])(?:\s|\\[nrtvfr])*\1/.test(text)) {
    return true;
  }

  return false;
};
