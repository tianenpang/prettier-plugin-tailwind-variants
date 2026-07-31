import type { Parser, Plugin } from 'prettier';
import { applyEdits, collectArrayNormalizeEdits, mayNeedTvTransform } from './normalize-arrays.js';
import { tvDefaultOptions, tvPrettierOptions } from './options.js';
import { shouldWrapParser, type CoreParserName } from './parser-support.js';
import { getTransformRegions } from './script-regions.js';
import type { EstreeNode, PluginOptions, TextEdit } from './types.js';

const coreParserCache = new Map<CoreParserName, Promise<Parser>>();

type ParserLoader = () => Parser | Promise<Parser | undefined> | undefined;
type ParserLike = Parser | ParserLoader;

/** Accepts default or namespace import from `prettier-plugin-tailwindcss` (v0.8 async loaders). */
export interface TailwindPluginModule {
  parsers?: Record<string, ParserLike | undefined>;
  options?: Plugin['options'];
  defaultOptions?: Plugin['defaultOptions'];
  printers?: Record<string, unknown>;
  [key: string]: unknown;
}

const isParserLoader = (value: unknown): value is ParserLoader => {
  return typeof value === 'function';
};

const resolveParser = async (parser: ParserLike): Promise<Parser> => {
  if (isParserLoader(parser)) {
    const resolved = await parser();
    if (!resolved) {
      throw new Error('Parser loader returned undefined');
    }
    return resolved;
  }

  return parser;
};

const resolveTailwindPlugin = (input: TailwindPluginModule): TailwindPluginModule => {
  if (input.parsers && typeof input.parsers === 'object') {
    return input;
  }

  const nested = input.default;
  if (nested && typeof nested === 'object') {
    const candidate = nested as TailwindPluginModule;
    if (candidate.parsers && typeof candidate.parsers === 'object') {
      return candidate;
    }
  }

  throw new TypeError(
    'tailwindVariants: expected prettier-plugin-tailwindcss module (default or namespace import)'
  );
};

/**
 * Compose `prettier-plugin-tailwindcss` with Tailwind Variants array
 * normalization, then official class sorting.
 *
 * @example
 * ```js
 * import * as tailwindcss from 'prettier-plugin-tailwindcss'
 * import tailwindVariants from 'prettier-plugin-tailwind-variants'
 *
 * export default {
 *   plugins: [tailwindVariants(tailwindcss)],
 *   tvFunctions: ['tv'],
 * }
 * ```
 */
export const tailwindVariants = (tailwindPluginInput: TailwindPluginModule): Plugin => {
  const tailwindPlugin = resolveTailwindPlugin(tailwindPluginInput);

  const parsers: Record<string, ParserLike> = {};

  for (const [name, parser] of Object.entries(tailwindPlugin.parsers!)) {
    if (!parser) {
      continue;
    }

    if (!shouldWrapParser(name)) {
      parsers[name] = parser;
      continue;
    }

    // Async loader form (prettier-plugin-tailwindcss v0.8+)
    if (isParserLoader(parser)) {
      parsers[name] = async () => {
        const resolved = await resolveParser(parser);
        return wrapParser(resolved, name, tailwindPlugin);
      };
      continue;
    }

    // Classic parser object form
    if (typeof parser.parse === 'function') {
      parsers[name] = wrapParser(parser, name, tailwindPlugin);
      continue;
    }

    parsers[name] = parser;
  }

  return {
    ...(tailwindPlugin as Plugin),
    parsers: parsers as Plugin['parsers'],
    options: {
      ...tailwindPlugin.options,
      ...tvPrettierOptions
    },
    defaultOptions: {
      ...(tailwindPlugin.defaultOptions ?? {}),
      ...tvDefaultOptions
    }
  };
};

const wrapParser = (parser: Parser, name: string, tailwindPlugin: TailwindPluginModule): Parser => {
  const originalParse = parser.parse;

  return {
    ...parser,
    parse: async (...args: Parameters<Parser['parse']>) => {
      let text = args[0];
      const options = args[1] as PluginOptions;

      if (mayNeedTvTransform(text, options)) {
        const normalized = await normalizeClassArraysInText(text, options, name, tailwindPlugin);

        if (normalized !== text) {
          text = normalized;
          options.originalText = normalized;
        }
      }

      const parseArgs = [text, options, ...args.slice(2)] as Parameters<Parser['parse']>;
      return await Promise.resolve(originalParse.apply(parser, parseArgs));
    }
  };
};

const normalizeClassArraysInText = async (
  text: string,
  options: PluginOptions,
  parserName: string,
  tailwindPlugin: TailwindPluginModule
): Promise<string> => {
  const regions = getTransformRegions(text, parserName);

  if (regions.length === 0) {
    return text;
  }

  const fileEdits: TextEdit[] = [];

  for (const region of regions) {
    // Per-region gate: avoid parsing script blocks that cannot contain TV work.
    if (!mayNeedTvTransform(region.content, options)) {
      continue;
    }

    const coreParser = await getCoreParser(region.coreParser);
    let ast: EstreeNode;

    try {
      ast = (await Promise.resolve(
        coreParser.parse(region.content, options as never)
      )) as EstreeNode;
    } catch {
      // Script region may be incomplete / non-JS — leave it alone.
      continue;
    }

    const regionEdits = await collectArrayNormalizeEdits(
      ast,
      options,
      region.content,
      tailwindPlugin
    );

    for (const edit of regionEdits) {
      fileEdits.push({
        start: edit.start + region.start,
        end: edit.end + region.start,
        replacement: edit.replacement
      });
    }
  }

  if (!fileEdits.length) {
    return text;
  }

  return applyEdits(text, fileEdits);
};

const getCoreParser = (parserName: CoreParserName): Promise<Parser> => {
  let cached = coreParserCache.get(parserName);

  if (cached) {
    return cached;
  }

  cached = (async () => {
    if (parserName === 'babel-ts') {
      const babelPlugin = (await import('prettier/plugins/babel.mjs')).default;
      const entry = babelPlugin.parsers?.['babel-ts'];
      if (!entry) {
        throw new Error('prettier/plugins/babel.mjs is missing babel-ts parser');
      }
      return resolveParser(entry as ParserLike);
    }

    const tsPlugin = (await import('prettier/plugins/typescript.mjs')).default;
    const entry = tsPlugin.parsers?.typescript;
    if (!entry) {
      throw new Error('prettier/plugins/typescript.mjs is missing typescript parser');
    }
    return resolveParser(entry as ParserLike);
  })();

  coreParserCache.set(parserName, cached);
  return cached;
};

export { tvDefaultOptions, tvPrettierOptions };
export type { PluginOptions };
export { standalonePlugin } from './standalone.js';

export default tailwindVariants;
