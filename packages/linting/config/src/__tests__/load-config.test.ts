import { describe, it, expect } from 'vitest';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { loadLintConfig } from '../load-lint-config.js';
import { balancedConfig } from '../balanced-config.js';

// ── Helpers ───────────────────────────────────────────────────────────────────

const ROOT = join(dirname(fileURLToPath(import.meta.url)), 'fixtures');

/** Resolves a path inside the fixtures directory. */
function fixture(name: string): string {
  return join(ROOT, name);
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('loadLintConfig', () => {
  it('returns null when the directory contains no config file', async () => {
    // Use an isolated tmp tree (with its own .git boundary marker) rather than a
    // fixture nested inside this repo, so this test doesn't pick up the real
    // repo's root fusion-lint.config.json when findUp walks upward.
    const tmpRoot = await mkdtemp(join(tmpdir(), 'fusion-lint-no-config-'));
    try {
      await writeFile(join(tmpRoot, '.git'), 'gitdir: /elsewhere\n');
      const result = await loadLintConfig({ cwd: tmpRoot });

      expect(result).toBeNull();
    } finally {
      await rm(tmpRoot, { recursive: true, force: true });
    }
  });

  describe('JSON config', () => {
    it('loads a flat severity map from fusion-lint.config.json', async () => {
      const result = await loadLintConfig({ cwd: fixture('json') });

      expect(result).toEqual({
        config: { 'require-tsdoc': 'error', 'require-intent-comment': 'warn' },
        customRules: [],
        ignorePatterns: [],
        ruleMatchers: {},
      });
    });

    it('loads per-rule severity plus includePattern/excludePattern from a rich fusion-lint.config.json', async () => {
      const result = await loadLintConfig({ cwd: fixture('json-rich-matchers') });

      expect(result?.config).toEqual({
        'require-tsdoc': 'error',
        'single-export-per-file': 'warn',
      });

      expect(Object.keys(result?.ruleMatchers ?? {})).toEqual([
        'single-export-per-file',
        'no-class-components',
      ]);
      // excludePattern-only: matches everything except the excluded basenames
      const singleExportMatcher = result?.ruleMatchers['single-export-per-file'];
      expect(singleExportMatcher?.('/src/module.ts')).toBe(false);
      expect(singleExportMatcher?.('/src/bookmark.schemas.ts')).toBe(false);
      expect(singleExportMatcher?.('/src/user.ts')).toBe(true);
      // includePattern-only: only matches the included basenames
      const noClassComponentsMatcher = result?.ruleMatchers['no-class-components'];
      expect(noClassComponentsMatcher?.('/src/Component.tsx')).toBe(true);
      expect(noClassComponentsMatcher?.('/src/util.ts')).toBe(false);
    });

    it('loads a preset before applying per-rule overrides', async () => {
      const result = await loadLintConfig({ cwd: fixture('json-preset') });

      expect(result?.config).toEqual({
        ...balancedConfig,
        'require-tsdoc': 'error',
      });
    });

    it('rejects an unknown preset', async () => {
      await expect(loadLintConfig({ cwd: fixture('json-invalid-preset') })).rejects.toThrow(
        'Unknown Fusion lint preset: maximum',
      );
    });

    it('layers a rich config over the provided default base', async () => {
      const base = { 'require-tsdoc': 'off', 'no-empty-catch': 'error' } as const;
      const result = await loadLintConfig({ cwd: fixture('json-rich-matchers'), base });

      expect(result?.config).toMatchObject({
        'require-tsdoc': 'error',
        'no-empty-catch': 'error',
      });
    });
  });

  describe('YAML config', () => {
    it('loads a flat severity map from .fusion-lintrc.yml', async () => {
      const result = await loadLintConfig({ cwd: fixture('yml') });

      expect(result).toEqual({
        config: { 'require-tsdoc': 'error', 'require-intent-comment': 'warn' },
        customRules: [],
        ignorePatterns: [],
        ruleMatchers: {},
      });
    });

    it('loads a flat severity map from .fusion-lintrc.yaml', async () => {
      const result = await loadLintConfig({ cwd: fixture('yaml') });

      expect(result).toEqual({
        config: { 'require-tsdoc': 'error', 'require-intent-comment': 'warn' },
        customRules: [],
        ignorePatterns: [],
        ruleMatchers: {},
      });
    });
  });

  describe('TypeScript config', () => {
    it('loads a flat severity map from a default-export object', async () => {
      const result = await loadLintConfig({ cwd: fixture('ts-flat') });

      expect(result).toEqual({
        config: { 'require-tsdoc': 'error', 'require-intent-comment': 'warn' },
        customRules: [],
        ignorePatterns: [],
        ruleMatchers: {},
      });
    });

    it('executes a builder factory: recommended base, configureRule, and addRule', async () => {
      const base = { 'require-tsdoc': 'warn', 'require-intent-comment': 'warn' } as const;
      const result = await loadLintConfig({ cwd: fixture('ts-builder'), base });

      // recommended = true merges the base; configureRule promotes require-tsdoc to error
      expect(result?.config['require-tsdoc']).toBe('error');
      expect(result?.config['require-intent-comment']).toBe('warn');
      // addRule registers the custom rule
      expect(result?.customRules).toHaveLength(1);
      expect(result?.customRules[0].id).toBe('custom-fixture-rule');
      expect(result?.customRules[0].defaultSeverity).toBe('warn');
      // ignorePatterns is passed through from the builder
      expect(result?.ignorePatterns).toEqual(['**/__tests__/**']);
    });

    it('custom rule check function is callable', async () => {
      const result = await loadLintConfig({ cwd: fixture('ts-builder'), base: {} });
      const [rule] = result?.customRules ?? [];

      expect(rule?.check('const x = 1;', { filePath: 'test.ts' })).toEqual([]);
    });
  });

  describe('JavaScript rich config', () => {
    it('loads { rules, customRules } from a .fusion-lintrc.js default export', async () => {
      const result = await loadLintConfig({ cwd: fixture('js-rich') });

      expect(result?.config).toEqual({
        'require-tsdoc': 'error',
        'require-intent-comment': 'warn',
      });
      expect(result?.customRules).toHaveLength(1);
      expect(result?.customRules[0].id).toBe('custom-fixture-rule');
      expect(result?.customRules[0].defaultSeverity).toBe('warn');
    });

    it('custom rule check function from rich config is callable', async () => {
      const result = await loadLintConfig({ cwd: fixture('js-rich') });
      const [rule] = result?.customRules ?? [];

      expect(rule?.check('const x = 1;', { filePath: 'test.ts' })).toEqual([]);
    });

    it('loads ignorePatterns from a rich config', async () => {
      const result = await loadLintConfig({ cwd: fixture('js-rich') });

      expect(result?.ignorePatterns).toEqual(['**/__tests__/**']);
    });
  });

  describe('find-up', () => {
    it('finds a config file in an ancestor directory by default', async () => {
      const result = await loadLintConfig({ cwd: fixture('find-up/nested/deep') });

      expect(result).toEqual({
        config: { 'require-tsdoc': 'error', 'require-intent-comment': 'warn' },
        customRules: [],
        ignorePatterns: [],
        ruleMatchers: {},
      });
    });

    it('returns null when findUp is disabled and cwd has no config of its own', async () => {
      const result = await loadLintConfig({
        cwd: fixture('find-up/nested/deep'),
        findUp: false,
      });

      expect(result).toBeNull();
    });

    it('stops walking up once a directory containing .git has been checked', async () => {
      // Build a throwaway tree so this test doesn't depend on the real repo layout:
      // <tmp>/fusion-lint.config.json   (must NOT be found)
      // <tmp>/repo/.git                 (repo root boundary marker)
      // <tmp>/repo/nested/              (search starts here)
      const tmpRoot = await mkdtemp(join(tmpdir(), 'fusion-lint-find-up-'));
      try {
        await writeFile(
          join(tmpRoot, 'fusion-lint.config.json'),
          JSON.stringify({ 'require-tsdoc': 'error' }),
        );
        const repoDir = join(tmpRoot, 'repo');
        const nestedDir = join(repoDir, 'nested');
        await mkdir(nestedDir, { recursive: true });
        await writeFile(join(repoDir, '.git'), 'gitdir: /elsewhere\n');

        const result = await loadLintConfig({ cwd: nestedDir });

        expect(result).toBeNull();
      } finally {
        await rm(tmpRoot, { recursive: true, force: true });
      }
    });
  });
});
