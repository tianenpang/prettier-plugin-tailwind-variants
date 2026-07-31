#!/usr/bin/env node

/**
 * Extract the changelog section for a given version from CHANGELOG.md.
 *
 * @example
 * pnpm release-notes 0.1.0
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const version = (process.argv[2] ?? '').replace(/^v/, '');
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const changelogPath = path.join(root, 'CHANGELOG.md');

if (!version) {
  console.error('Usage: pnpm release-notes <version>');
  process.exit(1);
}

const changelog = fs.readFileSync(changelogPath, 'utf8');
const heading = `## ${version}`;
const start = changelog.indexOf(heading);

if (start === -1) {
  console.log(`Release ${version}`);
  process.exit(0);
}

const afterHeading = changelog.slice(start + heading.length);
const nextHeading = afterHeading.search(/\n## /);
const body = (nextHeading === -1 ? afterHeading : afterHeading.slice(0, nextHeading)).trim();

console.log(body || `Release ${version}`);
