import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { formatWithTv } from './utils.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fixturesDir = path.join(__dirname, 'fixtures');

type FixtureOptions = Record<string, unknown>;

const isFixtureDir = async (dir: string): Promise<boolean> => {
  try {
    await fs.access(path.join(dir, 'input.ts'));
    await fs.access(path.join(dir, 'output.ts'));
    return true;
  } catch {
    return false;
  }
};

const loadOptions = async (dir: string): Promise<FixtureOptions> => {
  try {
    const raw = await fs.readFile(path.join(dir, 'options.json'), 'utf8');
    return JSON.parse(raw) as FixtureOptions;
  } catch {
    return {};
  }
};

const discoverFixtures = async (): Promise<string[]> => {
  const entries = await fs.readdir(fixturesDir, { withFileTypes: true });
  const names: string[] = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) {
      continue;
    }
    const dir = path.join(fixturesDir, entry.name);
    if (await isFixtureDir(dir)) {
      names.push(entry.name);
    }
  }

  return names.sort();
};

const fixtureNames = await discoverFixtures();

describe('fixtures', () => {
  it('discovers at least one golden fixture', () => {
    expect(fixtureNames.length).toBeGreaterThan(0);
  });

  for (const name of fixtureNames) {
    it(name, async () => {
      const dir = path.join(fixturesDir, name);
      const input = await fs.readFile(path.join(dir, 'input.ts'), 'utf8');
      const expected = await fs.readFile(path.join(dir, 'output.ts'), 'utf8');
      const options = await loadOptions(dir);
      const out = await formatWithTv(input, options);
      expect(out).toBe(expected);
    });
  }
});
