import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { loadFakerMap } from '../src/load-faker-map';

const fixturesDir = join(fileURLToPath(new URL('.', import.meta.url)), 'fixtures');

describe('loadFakerMap', () => {
  it('returns an already-built map as-is', async () => {
    const map = { 'User.email': 'internet.email' };

    await expect(loadFakerMap(map)).resolves.toBe(map);
  });

  it('loads and parses a .json sidecar', async () => {
    const map = await loadFakerMap('fields-json.faker.json', { baseDir: fixturesDir });

    expect(map).toEqual({ 'User.email': 'internet.email' });
  });

  it('loads and parses a .yaml sidecar', async () => {
    const map = await loadFakerMap('fields-yaml.faker.yaml', { baseDir: fixturesDir });

    expect(map).toEqual({ 'User.email': 'internet.email' });
  });

  it('loads a .ts sidecar, whose default export may include real functions', async () => {
    const map = await loadFakerMap('fields-ts.faker.ts', { baseDir: fixturesDir });

    expect(map['User.email']).toBe('internet.email');
    expect(typeof map['User.id']).toBe('function');
    expect(
      (map['User.id'] as (context: { modelName: string; path: string[] }) => unknown)({
        modelName: 'User',
        path: ['id'],
      }),
    ).toBe('User:id');
  });
});
