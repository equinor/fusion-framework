import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { ensureGitIgnoredDir } from '../ensure-git-ignored-dir.js';
import { resolveAnalytics } from '../resolve-analytics.js';

const root = resolve('/app');

describe('resolveAnalytics', () => {
  it('records to the default file and loads no seeds by default', () => {
    expect(resolveAnalytics(root, {})).toEqual({
      record: resolve(root, '.fusion-mock/analytics.jsonl'),
      defaultRecord: true,
      seed: [],
    });
  });

  it('prefers flags over config over plugin defaults', () => {
    const defaults = { record: 'defaults.jsonl', seed: 'defaults-seed' };
    const config = { record: 'config.jsonl', seed: ['config-seed'] };

    expect(resolveAnalytics(root, { config, defaults })).toEqual({
      record: resolve(root, 'config.jsonl'),
      defaultRecord: false,
      seed: [resolve(root, 'config-seed')],
    });
    expect(resolveAnalytics(root, { defaults })).toEqual({
      record: resolve(root, 'defaults.jsonl'),
      defaultRecord: false,
      seed: [resolve(root, 'defaults-seed')],
    });
    expect(resolveAnalytics(root, { record: 'flag.jsonl', seed: ['s'], config, defaults })).toEqual(
      {
        record: resolve(root, 'flag.jsonl'),
        defaultRecord: false,
        seed: [resolve(root, 's')],
      },
    );
  });

  it('keeps analytics in memory when recording is turned off', () => {
    expect(resolveAnalytics(root, { record: false })?.record).toBeUndefined();
    expect(resolveAnalytics(root, { config: { record: false } })?.record).toBeUndefined();
  });

  it.each([
    [{ enabled: false }],
    [{ enabled: false, seed: ['s'] }],
    [{ config: false as const }],
    [{ defaults: false as const }],
  ])('turns analytics off for %j', (options) => {
    expect(resolveAnalytics(root, options)).toBeUndefined();
  });

  it('turns analytics on with a flag even when config turns them off', () => {
    expect(resolveAnalytics(root, { seed: ['s'], config: false })?.seed).toEqual([
      resolve(root, 's'),
    ]);
  });

  it('uses config over a disabling plugin default', () => {
    expect(resolveAnalytics(root, { config: {}, defaults: false })).toBeDefined();
  });
});

describe('ensureGitIgnoredDir', () => {
  let dir: string;

  beforeEach(async () => {
    dir = await mkdtemp(join(tmpdir(), 'git-ignored-'));
  });

  afterEach(async () => {
    await rm(dir, { recursive: true, force: true });
  });

  it('creates the folder with a .gitignore that ignores everything', async () => {
    const target = join(dir, '.fusion-mock');

    await ensureGitIgnoredDir(target);

    expect(await readFile(join(target, '.gitignore'), 'utf8')).toBe('*\n');
  });

  it('keeps an existing .gitignore', async () => {
    await writeFile(join(dir, '.gitignore'), '!analytics.jsonl\n');

    await ensureGitIgnoredDir(dir);

    expect(await readFile(join(dir, '.gitignore'), 'utf8')).toBe('!analytics.jsonl\n');
  });
});
