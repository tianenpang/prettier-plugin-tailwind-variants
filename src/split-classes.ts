/**
 * Split a Tailwind class string into tokens (space-separated at depth 0).
 * Respects `[...]` and quoted stretches inside brackets.
 */
export const splitClasses = (input: string): string[] => {
  const tokens: string[] = [];
  const n = input.length;
  let i = 0;

  while (i < n) {
    while (i < n && /\s/.test(input[i]!)) {
      i++;
    }

    if (i >= n) {
      break;
    }

    const start = i;
    let bracket = 0;
    let quote: string | null = null;

    while (i < n) {
      const c = input[i]!;

      if (quote) {
        if (c === '\\' && i + 1 < n) {
          i += 2;
          continue;
        }

        if (c === quote) {
          quote = null;
        }

        i++;
        continue;
      }

      if (c === '"' || c === "'" || c === '`') {
        quote = c;
        i++;
        continue;
      }

      if (c === '[') {
        bracket++;
      } else if (c === ']') {
        bracket--;
      }

      if (/\s/.test(c) && bracket === 0) {
        break;
      }

      i++;
    }

    tokens.push(input.slice(start, i));
  }

  return tokens;
};

/**
 * Split a class token into `:` segments only at top-level (respects `[...]`).
 */
export const splitVariantSegments = (className: string): string[] => {
  const segments: string[] = [];
  const n = className.length;
  let start = 0;
  let i = 0;
  let bracket = 0;
  let quote: string | null = null;

  while (i < n) {
    const c = className[i]!;

    if (quote) {
      if (c === '\\' && i + 1 < n) {
        i += 2;
        continue;
      }

      if (c === quote) {
        quote = null;
      }

      i++;
      continue;
    }

    if (c === '"' || c === "'" || c === '`') {
      quote = c;
      i++;
      continue;
    }

    if (c === '[') {
      bracket++;
    } else if (c === ']') {
      bracket--;
    } else if (c === ':' && bracket === 0) {
      segments.push(className.slice(start, i));
      start = i + 1;
    }

    i++;
  }

  segments.push(className.slice(start, i));

  return segments;
};
