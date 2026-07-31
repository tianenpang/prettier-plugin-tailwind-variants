import type { Parser, Plugin } from 'prettier';
import babelPlugin from 'prettier/plugins/babel.mjs';
import tsPlugin from 'prettier/plugins/typescript.mjs';
import { applyEdits, collectArrayNormalizeEdits } from './normalize-arrays.js';
import { tvDefaultOptions, tvPrettierOptions } from './options.js';
import type { EstreeNode, PluginOptions } from './types.js';

type ParserLoader = () => Parser | Promise<Parser>;

const isParserLoader = (value: unknown): value is ParserLoader => {
  return typeof value === 'function';
};

const resolveParser = async (parser: Parser | ParserLoader): Promise<Parser> => {
  if (isParserLoader(parser)) {
    return parser();
  }

  return parser;
};

const wrapParserEntry = (entry: Parser | ParserLoader): ParserLoader => {
  return async () => {
    const parser = await resolveParser(entry);
    const originalParse = parser.parse;

    return {
      ...parser,
      parse: async (text, options) => {
        const pluginOptions = options as unknown as PluginOptions;
        const preAst = (await Promise.resolve(
          originalParse.call(parser, text, options)
        )) as EstreeNode;
        const edits = await collectArrayNormalizeEdits(preAst, pluginOptions, text, undefined);
        const normalized = edits.length ? applyEdits(text, edits) : text;

        if (normalized === text) {
          return preAst;
        }

        return originalParse.call(parser, normalized, options);
      }
    };
  };
};

/**
 * @internal Structure-only plugin used in tests. Not a supported public API —
 * apps must use the default export `tailwindVariants(tailwindcss)`.
 */
export const standalonePlugin: Plugin = {
  parsers: {
    typescript: wrapParserEntry(
      tsPlugin.parsers!.typescript as Parser | ParserLoader
    ) as unknown as Parser,
    'babel-ts': wrapParserEntry(
      babelPlugin.parsers!['babel-ts'] as Parser | ParserLoader
    ) as unknown as Parser
  },
  options: tvPrettierOptions,
  defaultOptions: tvDefaultOptions
};
