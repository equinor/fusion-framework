import { describe, it, expect } from 'vitest';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';
import { loadLintConfig } from '../load-config.js';

// ── Helpers ───────────────────────────────────────────────────────────────────

const ROOT = join(dirname(fileURLToPath(import.meta.url)), 'fixtures');

/** Resolves a path inside the fixtures directory. */
function fixture(name: string): string {
  return join(ROOT, name);
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('loadLintConfig', () => {
  it('returns null when the directory contains no config file', async () => {
    const result = await loadLintConfig({ cwd: fixture('no-config') });

    expect(result).toBeNull();
  });

  describe('JSON config', () => {
    it('loads a flat severity map from fusion-lint.config.json', async () => {
      const result = await loadLintConfig({ cwd: fixture('json') });

      expect(result).toEqual({
        config: { 'require-tsdoc': 'error', 'require-intent-comment': 'warn' },
        customRules: [],
      });
    });
  });

  describe('YAML config', () => {
    it('loads a flat severity map from .fusion-lintrc.yml', async () => {
      const result = await loadLintConfig({ cwd: fixture('yml') });

      expect(result).toEqual({
        config: { 'require-tsdoc': 'error', 'require-intent-comment': 'warn' },
        customRules: [],
      });
    });

    it('loads a flat severity map from .fusion-lintrc.yaml', async () => {
      const result = await loadLintConfig({ cwd: fixture('yaml') });

      expect(result).toEqual({
        config: { 'require-tsdoc': 'error', 'require-intent-comment': 'warn' },
        customRules: [],
      });
    });
  });

  describe('TypeScript config', () => {
    it('loads a flat severity map from a default-export object', async () => {
      const result = await loadLintConfig({ cwd: fixture('ts-flat') });

      expect(result).toEqual({
        config: { 'require-tsdoc': 'error', 'require-intent-comment': 'warn' },
        customRules: [],
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
    });

    it('custom rule check function is callable', async () => {
      const result = await loadLintConfig({ cwd: fixture('ts-builder'), base: {} });
      const [rule] = result?.customRules ?? [];

      expect(rule?.check('const x = 1;', 'test.ts')).toEqual([]);
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

      expect(rule?.check('const x = 1;', 'test.ts')).toEqual([]);
    });
  });
});
