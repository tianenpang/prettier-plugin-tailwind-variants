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

## Changelog and releases

**Source of truth:** [`CHANGELOG.md`](./CHANGELOG.md) ([Keep a Changelog](https://keepachangelog.com/) + SemVer).

GitHub Release bodies are generated **from** the changelog — edit `CHANGELOG.md` on `main`, not the Release UI.

| Section                                           | Use for                                  |
| ------------------------------------------------- | ---------------------------------------- |
| `### Added`                                       | New options, surfaces, capabilities      |
| `### Changed`                                     | Behavior / defaults that stay compatible |
| `### Fixed`                                       | Bug fixes                                |
| `### Deprecated` / `### Removed` / `### Security` | As needed                                |

### Release flow

1. Under `## [Unreleased]`, keep notes updated as PRs land (same categories).
2. When cutting a release (e.g. `0.2.0`):
   - Rename `[Unreleased]` → `[0.2.0] - YYYY-MM-DD`
   - Add a fresh empty `## [Unreleased]`
   - Update compare links at the bottom of `CHANGELOG.md`
   - Bump `package.json` `version`
3. Tag / run **Prepare Release** (`v0.2.0` or workflow_dispatch). The draft release body is:
   - that version’s changelog section, then
   - an auto **Full Changelog** compare link to the previous tag
4. Review the draft → publish. The Release workflow then publishes to npm.

```bash
pnpm release-notes 0.1.0                  # preview body
pnpm release-notes 0.2.0 --previous v0.1.0
```

Default npm channel for this feature set: **0.2.0** (minor — additive options, compatible defaults). Use `1.0.0` only when committing to a stable public API.

## Maintainer checklist (new repo)

```bash
gh label create bug --color d73a4a --description "Something isn't working" --force
gh label create enhancement --color a2eeef --description "New feature or request" --force
```

Enable private vulnerability reporting under **Settings → Code security** so Security Advisories work.
