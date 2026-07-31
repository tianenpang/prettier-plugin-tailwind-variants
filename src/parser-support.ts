/**
 * Parsers where Tailwind Variants calls live in the full file text (ESTree Program).
 * Mapped to a Prettier core parser used for our pre-pass AST.
 */
const JS_CORE_PARSERS: Record<string, 'typescript' | 'babel-ts'> = {
  typescript: 'typescript',
  'babel-ts': 'babel-ts',
  babel: 'babel-ts',
  'babel-flow': 'babel-ts',
  flow: 'babel-ts',
  meriyah: 'babel-ts',
  acorn: 'babel-ts',
  oxc: 'babel-ts',
  'oxc-ts': 'typescript',
  hermes: 'babel-ts',
  __js_expression: 'babel-ts',
  astroExpressionParser: 'babel-ts'
};

/**
 * Markup / framework parsers that embed JS/TS in script (or Astro frontmatter).
 * We extract those regions and run the TV transform inside them.
 */
const EMBEDDED_SCRIPT_PARSERS = new Set([
  'vue',
  'svelte',
  'astro',
  'angular',
  'html',
  'lwc',
  'glimmer',
  'marko',
  'pug',
  'twig',
  'liquid-html'
]);

/** CSS parsers — no Tailwind Variants transform. */
const PASSTHROUGH_PARSERS = new Set(['css', 'scss', 'less']);

export type CoreParserName = 'typescript' | 'babel-ts';

export type TransformMode = 'javascript' | 'embedded-scripts' | 'passthrough';

export const getTransformMode = (parserName: string): TransformMode => {
  if (PASSTHROUGH_PARSERS.has(parserName)) {
    return 'passthrough';
  }

  if (parserName in JS_CORE_PARSERS) {
    return 'javascript';
  }

  if (EMBEDDED_SCRIPT_PARSERS.has(parserName)) {
    return 'embedded-scripts';
  }

  // Unknown parser from a future TW plugin: try embedded extraction (safe no-op if none).
  return 'embedded-scripts';
};

export const getCoreParserName = (parserName: string): CoreParserName => {
  return JS_CORE_PARSERS[parserName] ?? 'typescript';
};

export const shouldWrapParser = (parserName: string): boolean => {
  return getTransformMode(parserName) !== 'passthrough';
};
