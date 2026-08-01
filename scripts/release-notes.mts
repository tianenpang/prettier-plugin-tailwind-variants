#!/usr/bin/env node

/**
 * Build GitHub Release body from CHANGELOG.md (source of truth).
 *
 * Usage:
 *   pnpm release-notes <version> [--previous <tag>]
 *
 * Output:
 *   1. The Keep a Changelog section for that version (## [x.y.z] …)
 *   2. A "Full Changelog" compare link when a previous tag is known
 *
 * Env:
 *   RELEASE_PREVIOUS_TAG — previous git tag (e.g. v0.1.0), same as --previous
 *   RELEASE_REPO_URL     — override repo URL for compare links
 */

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const changelogPath = path.join(root, 'CHANGELOG.md');

const args = process.argv.slice(2);
let version = '';
let previousTag = process.env.RELEASE_PREVIOUS_TAG?.trim() ?? '';

for (let i = 0; i < args.length; i++) {
  const arg = args[i]!;
  if (arg === '--previous') {
    previousTag = (args[++i] ?? '').trim();
    continue;
  }
  if (!version && !arg.startsWith('-')) {
    version = arg.replace(/^v/, '');
  }
}

if (!version) {
  console.error('Usage: pnpm release-notes <version> [--previous <tag>]');
  process.exit(1);
}

const changelog = fs.readFileSync(changelogPath, 'utf8');
const section = extractChangelogSection(changelog, version);

if (!section) {
  console.error(
    `No CHANGELOG section found for ${version} (expected "## [${version}]" or "## ${version}").`
  );
  console.error('Move [Unreleased] entries into a dated version heading before releasing.');
  process.exit(1);
}

const repoUrl =
  process.env.RELEASE_REPO_URL?.replace(/\/$/, '') ??
  detectRepoUrl() ??
  'https://github.com/tianenpang/prettier-plugin-tailwind-variants';

const currentTag = `v${version}`;
const prev = previousTag !== '' ? previousTag : detectPreviousTag(currentTag);

const parts = [section];

if (prev) {
  parts.push('', `**Full Changelog**: ${repoUrl}/compare/${prev}...${currentTag}`);
} else {
  parts.push('', `**Release**: ${repoUrl}/releases/tag/${currentTag}`);
}

console.log(parts.join('\n').trimEnd() + '\n');

function extractChangelogSection(markdown: string, ver: string): string | null {
  // Match: ## [0.2.0] - 2026-08-01   or   ## [0.2.0]   or   ## 0.2.0
  const headingRe = new RegExp(
    `^##\\s+(?:\\[${escapeRegExp(ver)}\\]|${escapeRegExp(ver)})(?:\\s+-\\s+\\d{4}-\\d{2}-\\d{2})?\\s*$`,
    'm'
  );
  const match = headingRe.exec(markdown);
  if (!match || match.index === undefined) {
    return null;
  }

  const start = match.index + match[0].length;
  const rest = markdown.slice(start);
  // Next version heading or footer link definition at EOF-ish — stop at ## [
  const next = rest.search(/\n##\s+/);
  let body = (next === -1 ? rest : rest.slice(0, next)).trim();

  // Drop trailing Keep-a-Changelog link reference block if it leaked in
  body = body.replace(/(?:\n\[[^\]]+\]:\s*https?:\/\/\S+\s*)+$/g, '').trim();

  if (!body) {
    return null;
  }

  return `## ${ver}\n\n${body}`;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function detectRepoUrl(): string | null {
  try {
    const remote = execFileSync('git', ['config', '--get', 'remote.origin.url'], {
      cwd: root,
      encoding: 'utf8'
    }).trim();

    if (remote.startsWith('https://github.com/')) {
      return remote.replace(/\.git$/, '');
    }

    const ssh = /^git@github\.com:(.+?)(?:\.git)?$/.exec(remote);
    if (ssh) {
      return `https://github.com/${ssh[1]}`;
    }
  } catch {
    // ignore
  }
  return null;
}

function detectPreviousTag(currentTag: string): string | null {
  try {
    const tags = execFileSync('git', ['tag', '--sort=-version:refname'], {
      cwd: root,
      encoding: 'utf8'
    })
      .split('\n')
      .map((t) => t.trim())
      .filter((t) => /^v\d+\.\d+\.\d+/.test(t) && t !== currentTag);

    return tags[0] ?? null;
  } catch {
    return null;
  }
}
