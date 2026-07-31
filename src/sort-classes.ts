import path from 'node:path';
import type { PluginOptions } from './types.js';

interface Sorter {
  sortClassLists(classes: string[][]): string[][];
}

type CreateSorter = (opts: {
  base?: string;
  filepath?: string;
  configPath?: string;
  stylesheetPath?: string;
  preserveWhitespace?: boolean;
  preserveDuplicates?: boolean;
}) => Promise<Sorter>;

const sortCache = new Map<string, string[]>();
const MAX_CACHE = 2000;

/** Cache sorters by resolved config identity so we don't reload Tailwind per file. */
const sorterCache = new Map<string, Promise<Sorter>>();

const cacheSet = (key: string, value: string[]) => {
  if (sortCache.size >= MAX_CACHE) {
    const first = sortCache.keys().next().value;
    if (first !== undefined) {
      sortCache.delete(first);
    }
  }

  sortCache.set(key, value);
};

const asPathOption = (value: unknown): string | undefined => {
  return typeof value === 'string' && value.length > 0 ? value : undefined;
};

const resolveBase = (options: PluginOptions): string => {
  const filepath = asPathOption(options.filepath);

  if (!filepath) {
    return process.cwd();
  }

  const absolute = path.isAbsolute(filepath) ? filepath : path.resolve(process.cwd(), filepath);
  return path.dirname(absolute);
};

const resolveOptionPath = (value: string | undefined, base: string): string | undefined => {
  if (!value) {
    return undefined;
  }

  return path.isAbsolute(value) ? value : path.resolve(base, value);
};

const sorterIdentity = (options: PluginOptions) => {
  const base = resolveBase(options);
  const stylesheet = resolveOptionPath(asPathOption(options.tailwindStylesheet), base) ?? '';
  const config = resolveOptionPath(asPathOption(options.tailwindConfig), base) ?? '';
  const filepath = asPathOption(options.filepath) ?? '';

  return { base, stylesheet, config, filepath };
};

const cacheKey = (tokens: string[], identity: ReturnType<typeof sorterIdentity>) => {
  return `${identity.stylesheet}\0${identity.config}\0${identity.base}\0${tokens.join(' ')}`;
};

const sorterCacheKey = (identity: ReturnType<typeof sorterIdentity>) => {
  // Filepath dirname is already folded into `base`; keep filepath for TW content resolution.
  return `${identity.base}\0${identity.stylesheet}\0${identity.config}\0${identity.filepath}`;
};

const getSorter = async (options: PluginOptions): Promise<Sorter> => {
  const identity = sorterIdentity(options);
  const key = sorterCacheKey(identity);
  let pending = sorterCache.get(key);

  if (pending) {
    return pending;
  }

  pending = (async () => {
    const { createSorter } = (await import('prettier-plugin-tailwindcss/sorter')) as {
      createSorter: CreateSorter;
    };

    const sorterOptions: Parameters<CreateSorter>[0] = {
      base: identity.base
    };

    if (identity.filepath) {
      sorterOptions.filepath = identity.filepath;
    }

    if (identity.stylesheet) {
      sorterOptions.stylesheetPath = identity.stylesheet;
    }

    if (identity.config) {
      sorterOptions.configPath = identity.config;
    }

    return createSorter(sorterOptions);
  })();

  sorterCache.set(key, pending);

  try {
    return await pending;
  } catch (error) {
    sorterCache.delete(key);
    throw error;
  }
};

/**
 * Batch-sort token lists via `prettier-plugin-tailwindcss/sorter`.
 * Avoids nested `prettier.format` inside a parse hook (which does not sort reliably).
 *
 * When `tailwindPlugin` is omitted (standalone mode), groups are returned unchanged.
 */
export const sortClassTokenGroups = async (
  groups: string[][],
  options: PluginOptions,
  tailwindPlugin?: unknown
): Promise<string[][]> => {
  if (!tailwindPlugin || groups.length === 0) {
    return groups.map((g) => [...g]);
  }

  const identity = sorterIdentity(options);
  const results: Array<string[] | null> = new Array(groups.length).fill(null);
  const pending: Array<{ index: number; tokens: string[]; key: string }> = [];
  const keyToIndices = new Map<string, number[]>();

  for (let i = 0; i < groups.length; i++) {
    const tokens = groups[i]!;

    if (tokens.length <= 1) {
      results[i] = tokens;
      continue;
    }

    const key = cacheKey(tokens, identity);
    const hit = sortCache.get(key);

    if (hit) {
      results[i] = hit;
      continue;
    }

    const existing = keyToIndices.get(key);

    if (existing) {
      existing.push(i);
      continue;
    }

    keyToIndices.set(key, [i]);
    pending.push({ index: i, tokens, key });
  }

  if (pending.length === 0) {
    return results as string[][];
  }

  let sorter: Sorter;

  try {
    sorter = await getSorter(options);
  } catch {
    // No local Tailwind / invalid stylesheet — leave order unchanged.
    return groups.map((g) => [...g]);
  }

  const sortedLists = sorter.sortClassLists(pending.map((job) => job.tokens));

  for (let p = 0; p < pending.length; p++) {
    const job = pending[p]!;
    const sorted = sortedLists[p] ?? job.tokens;
    cacheSet(job.key, sorted);

    for (const idx of keyToIndices.get(job.key) ?? [job.index]) {
      results[idx] = sorted;
    }
  }

  return results as string[][];
};

/** Clear sort caches (tests / stylesheet hot-reload). */
export const clearSortCache = () => {
  sortCache.clear();
  sorterCache.clear();
};
