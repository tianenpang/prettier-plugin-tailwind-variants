#!/usr/bin/env node

/**
 * Map a version string to an npm dist-tag.
 *
 * @example
 * pnpm release-channel 0.1.0          → latest
 * pnpm release-channel 0.1.0-alpha.1  → alpha
 * pnpm release-channel 0.0.0-insiders.abc1234 → insiders
 */

const version = process.argv[2] ?? '';

if (!version) {
  console.error('Usage: pnpm release-channel <version>');
  process.exit(1);
}

if (version.includes('-insiders.')) {
  console.log('insiders');
  process.exit(0);
}

const match = /-([a-zA-Z]+)(?:\.|$)/.exec(version);

if (match?.[1]) {
  console.log(match[1].toLowerCase());
  process.exit(0);
}

console.log('latest');
