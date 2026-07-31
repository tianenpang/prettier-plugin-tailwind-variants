# prettier-plugin-tailwind-variants

<img src="./.github/banner.jpg" alt="prettier-plugin-tailwind-variants" />

A [Prettier v3+](https://prettier.io/) plugin for [Tailwind Variants](https://www.tailwind-variants.org/) that formats class arrays while preserving structure, then sorts them with [`prettier-plugin-tailwindcss`](https://github.com/tailwindlabs/prettier-plugin-tailwindcss) v0.8+.

## Installation

```sh
pnpm add -D prettier prettier-plugin-tailwindcss@^0.8.0 prettier-plugin-tailwind-variants
```

```js
// prettier.config.js
import * as tailwindcss from 'prettier-plugin-tailwindcss';
import tailwindVariants from 'prettier-plugin-tailwind-variants';

/** @type {import('prettier').Config} */
export default {
  plugins: [tailwindVariants(tailwindcss)],
  tailwindFunctions: ['tv'],
  tvFunctions: ['tv']
};
```

Always compose with `prettier-plugin-tailwindcss` as shown above.

## Options

### `tvFunctions`

Callee names to format. Default: `['tv']`.

```js
export default {
  plugins: [tailwindVariants(tailwindcss)],
  tvFunctions: ['tv', 'createTv'],
  // Keep Tailwind’s list in sync for string sorting
  tailwindFunctions: ['tv', 'createTv']
};
```

### `tvUnwrapSingleClassArrays`

When `true` (default), nested single-class arrays unwrap into the parent sort pool. Set `false` to keep nesting like `['shadow-sm', ['bg-blue-500']]`.

```js
export default {
  plugins: [tailwindVariants(tailwindcss)],
  tvUnwrapSingleClassArrays: false
};
```

Empty and whitespace-only class strings, and empty arrays, are removed.

## How classes are formatted

```ts
// Before
tv({
  base: ['text-white', ['py-2', 'px-4'], 'rounded-lg']
});

// After
tv({
  base: ['rounded-lg', ['px-4', 'py-2'], 'text-white']
});
```

1. Strings stay strings
2. Arrays stay arrays
3. Multi-class nested slots keep position; internals sort
4. Single-class nested arrays unwrap when enabled

### Surfaces

`base` · `slots` · `variants` · `compoundVariants` (`class` / `className`) · `compoundSlots` (`class` / `className`)

### Frameworks

JS/TS, plus `<script>` regions in Vue, Svelte, Astro, HTML, and similar. Install each framework’s Prettier plugin when you use that parser. CSS is left alone.

## Editor IntelliSense

Prefer key-scoped `tailwindCSS.experimental.classRegex` over `classFunctions: ["tv"]` so `defaultVariants` and compound conditions are not treated as classes.

| Complete                      | Skip                                         |
| ----------------------------- | -------------------------------------------- |
| `base`, slots, variant leaves | `defaultVariants`                            |
| `class` / `className`         | `compoundSlots[].slots` (names)              |
| Nested class arrays           | Conditions (`size: 'sm'`, `isActive: false`) |

Copy the `classRegex` from this repo’s [`.vscode/settings.json`](./.vscode/settings.json), and enable `"editor.quickSuggestions": { "strings": "on" }`.

## Limitations

- Static strings and literal arrays only
- Dynamic values skip that array
- Peers: `prettier`, `prettier-plugin-tailwindcss`

## Community

[Contributing](./CONTRIBUTING.md) · [Code of Conduct](./CODE_OF_CONDUCT.md) · [Security](./SECURITY.md) · [Support](./SUPPORT.md)

## License

[MIT](./LICENSE)
