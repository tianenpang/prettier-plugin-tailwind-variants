import { getCoreParserName, type CoreParserName } from './parser-support.js';

export interface ScriptRegion {
  /** Absolute offset of `content` within the full file. */
  start: number;
  end: number;
  content: string;
  coreParser: CoreParserName;
}

const SCRIPT_TAG_RE = /<script(\s[^>]*)?>([\s\S]*?)<\/script>/gi;
const ASTRO_FRONTMATTER_RE = /^---\r?\n([\s\S]*?)\r?\n---/;

/**
 * Locate JS/TS regions that may contain Tailwind Variants calls for the given Prettier parser.
 * - JavaScript parsers: the whole file
 * - Vue / Svelte / HTML-like: `<script>` blocks
 * - Astro: frontmatter + `<script>` blocks
 */
export const getTransformRegions = (text: string, parserName: string): ScriptRegion[] => {
  if (parserName === 'astro') {
    return [...extractAstroFrontmatter(text), ...extractScriptTags(text)];
  }

  if (
    parserName === 'vue' ||
    parserName === 'svelte' ||
    parserName === 'angular' ||
    parserName === 'html' ||
    parserName === 'lwc' ||
    parserName === 'glimmer' ||
    parserName === 'marko' ||
    parserName === 'pug' ||
    parserName === 'twig' ||
    parserName === 'liquid-html'
  ) {
    return extractScriptTags(text);
  }

  return [
    {
      start: 0,
      end: text.length,
      content: text,
      coreParser: getCoreParserName(parserName)
    }
  ];
};

const extractAstroFrontmatter = (text: string): ScriptRegion[] => {
  const match = ASTRO_FRONTMATTER_RE.exec(text);

  if (!match || match.index === undefined) {
    return [];
  }

  const body = match[1] ?? '';
  const full = match[0];
  // Body sits between the opening `---\n` and the closing `\n---`
  const start = match.index + full.indexOf(body);

  return [
    {
      start,
      end: start + body.length,
      content: body,
      coreParser: 'typescript'
    }
  ];
};

const extractScriptTags = (text: string): ScriptRegion[] => {
  const regions: ScriptRegion[] = [];
  SCRIPT_TAG_RE.lastIndex = 0;

  let match: RegExpExecArray | null;

  while ((match = SCRIPT_TAG_RE.exec(text)) !== null) {
    const attrs = match[1] ?? '';
    const body = match[2] ?? '';

    if (!shouldTransformScriptTag(attrs, body)) {
      continue;
    }

    const openTag = `<script${attrs}>`;
    const start = match.index + openTag.length;

    regions.push({
      start,
      end: start + body.length,
      content: body,
      coreParser: scriptLangToCoreParser(attrs)
    });
  }

  return regions;
};

const shouldTransformScriptTag = (attrs: string, body: string): boolean => {
  if (!body.trim()) {
    return false;
  }

  if (/\bsrc\s*=/i.test(attrs)) {
    return false;
  }

  const typeMatch = /\btype\s*=\s*(["'])([^"']*)\1/i.exec(attrs);
  const type = typeMatch?.[2]?.toLowerCase() ?? '';

  if (!type) {
    return true;
  }

  return type === 'module' || type.includes('javascript') || type.includes('typescript');
};

const scriptLangToCoreParser = (attrs: string): CoreParserName => {
  const langMatch = /\blang\s*=\s*(["'])([^"']*)\1/i.exec(attrs);
  const lang = langMatch?.[2]?.toLowerCase() ?? '';

  if (lang === 'ts' || lang === 'tsx' || lang === 'typescript') {
    return 'typescript';
  }

  return 'babel-ts';
};
