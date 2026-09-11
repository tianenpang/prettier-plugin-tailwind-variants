# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

How releases work: edit this file on `main` under `[Unreleased]`. Publishing a GitHub
Release copies that version’s section into the release body (plus a compare link).
Do not treat the GitHub Release editor as the source of truth.

## [Unreleased]

## [0.2.2] - 2026-09-10

### Changed

- Update project dependencies

## [0.2.1] - 2026-08-01

### Fixed

- Insert multiple unknown modifier groups (e.g. `max-sm`, `max-lg`) as one sorted block so their relative order stays ascending

## [0.2.0] - 2026-07-31

### Added

- `tvGroupByModifiers` — split class tokens into one string per modifier group
- `tvModifierGroupOrder` — customize modifier group order (ignored when grouping is off)
- `tvGroupByBreakpoints` — when grouping, emit each breakpoint (`sm`, `md`, …) as its own group
- `tvFlattenToString` — flatten arrays / nested arrays into a single class string
- Built-in modifier group order aligned with Tailwind / CSS / DX conventions

### Changed

- `tvRemoveEmptyClasses` (default `true`) — empty / whitespace-only class cleanup is now configurable; default matches 0.1.0

## [0.1.0] - 2026-07-31

### Added

- Initial release
- Compose with `prettier-plugin-tailwindcss` via `tailwindVariants`
- Normalize class arrays on `base`, `slots`, `variants`, `compoundVariants`, and `compoundSlots`
- Options: `tvFunctions`, `tvUnwrapSingleClassArrays`

[Unreleased]: https://github.com/tianenpang/prettier-plugin-tailwind-variants/compare/v0.2.2...HEAD
[0.2.2]: https://github.com/tianenpang/prettier-plugin-tailwind-variants/compare/v0.2.1...v0.2.2
[0.2.1]: https://github.com/tianenpang/prettier-plugin-tailwind-variants/compare/v0.2.0...v0.2.1
[0.2.0]: https://github.com/tianenpang/prettier-plugin-tailwind-variants/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/tianenpang/prettier-plugin-tailwind-variants/releases/tag/v0.1.0
