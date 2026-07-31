# Contributing

Thanks for taking an interest.

Please read the [Code of Conduct](./CODE_OF_CONDUCT.md). Security reports go to [SECURITY.md](./SECURITY.md), not public issues. Usage questions: [SUPPORT.md](./SUPPORT.md).

## Setup

Node.js ≥ 22 · pnpm ≥ 11 (`packageManager` is pinned in `package.json`)

```bash
pnpm install
pnpm build
pnpm test
pnpm lint
pnpm typecheck
pnpm format:check
```

| Script                 | Role                                      |
| ---------------------- | ----------------------------------------- |
| `pnpm test`            | Vitest                                    |
| `pnpm test:watch`      | Watch                                     |
| `pnpm lint`            | ESLint (Prettier via `prettier/prettier`) |
| `pnpm format`          | Prettier write                            |
| `pnpm typecheck`       | `tsc --noEmit`                            |
| `pnpm benchmark:quick` | Format cost vs Tailwind plugin alone      |

## Layout

| Path                 | Contents                                            |
| -------------------- | --------------------------------------------------- |
| `src/`               | Plugin (`tailwindVariants`, normalize, visit, sort) |
| `tests/`             | Units + golden fixtures                             |
| `tests/fixtures/*/`  | `input.ts` · `output.ts` · optional `options.json`  |
| `benchmark/`         | Perf scenarios                                      |
| `.github/workflows/` | CI, release, benchmark                              |

Public API: import the default export, then compose with `prettier-plugin-tailwindcss` — `tailwindVariants(tailwindcss)`. Not a standalone Prettier plugin.

## Pull requests

1. Branch from `main`. Keep the diff focused.
2. Match style in `src/` (arrow functions, ESLint + Prettier).
3. Prefer fixtures for format outcomes; keep unit tests for gates, options, and parsers.
4. Run `pnpm test && pnpm lint && pnpm typecheck && pnpm format:check`.
5. Use the PR template.

### Fixtures

- Must typecheck (`tailwind-variants` is a devDependency).
- Update `output.ts` when transform behavior changes.
- Prefer Tailwind v4 canonical class names (e.g. `wrap-break-word`).

`options.json` uses flat keys: `tvFunctions`, `tvUnwrapSingleClassArrays`, …

## Commits

[Conventional Commits](https://www.conventionalcommits.org/), via Husky + commitlint (and CI).

Types: `feat` · `fix` · `refactor` · `style` · `docs` · `test` · `build` · `ci` · `chore` · `revert`

```text
feat: sort arrays in Astro script blocks
fix: leave compound condition arrays untouched
```

PR titles follow the same shape (CI checks them — matters for squash merges).

| Hook         | Runs                            |
| ------------ | ------------------------------- |
| `pre-commit` | `lint-staged`, then `typecheck` |
| `commit-msg` | commitlint                      |

Skip hooks only if you must — CI still runs the full suite.

## Maintainer checklist (new repo)

```bash
gh label create bug --color d73a4a --description "Something isn't working" --force
gh label create enhancement --color a2eeef --description "New feature or request" --force
```

Enable private vulnerability reporting under **Settings → Code security** so Security Advisories work.
