import { describe, it, expect } from 'vitest';
import { LintEngine } from '../engine.js';
import type { Rule, Diagnostic } from '../types.js';

// ── Test doubles ─────────────────────────────────────────────────────────────

const makeRule = (id: string, diagnostics: Diagnostic[]): Rule => ({
  id,
  defaultSeverity: 'warn',
  check: () => diagnostics,
});

const makeDiagnostic = (overrides: Partial<Diagnostic> = {}): Diagnostic => ({
  file: 'test.ts',
  line: 1,
  col: 1,
  rule: 'test-rule',
  message: 'test message',
  severity: 'warn',
  ...overrides,
});

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('LintEngine', () => {
  it('runs all registered rules and collects diagnostics', () => {
    const d1 = makeDiagnostic({ rule: 'rule-a' });
    const d2 = makeDiagnostic({ rule: 'rule-b' });
    const engine = new LintEngine([makeRule('rule-a', [d1]), makeRule('rule-b', [d2])]);

    const result = engine.lint('const x = 1;', 'test.ts');

    expect(result).toHaveLength(2);
    expect(
      // Collect rule IDs from the diagnostics to verify ordering
      result.map((d) => d.rule),
    ).toEqual(['rule-a', 'rule-b']);
  });

  it('skips rules configured as "off"', () => {
    const rule = makeRule('test-rule', [makeDiagnostic()]);
    const engine = new LintEngine([rule], { 'test-rule': 'off' });

    expect(engine.lint('', 'test.ts')).toHaveLength(0);
  });

  it('overrides severity from config to "error"', () => {
    const rule = makeRule('test-rule', [makeDiagnostic({ severity: 'warn' })]);
    const engine = new LintEngine([rule], { 'test-rule': 'error' });

    const [diagnostic] = engine.lint('', 'test.ts');
    expect(diagnostic.severity).toBe('error');
  });

  it('overrides severity from config to "warn"', () => {
    const rule: Rule = {
      ...makeRule('test-rule', []),
      defaultSeverity: 'error',
      check: () => [makeDiagnostic({ severity: 'error' })],
    };
    const engine = new LintEngine([rule], { 'test-rule': 'warn' });

    const [diagnostic] = engine.lint('', 'test.ts');
    expect(diagnostic.severity).toBe('warn');
  });

  it('uses rule defaultSeverity when no config entry is present', () => {
    const rule: Rule = {
      id: 'test-rule',
      defaultSeverity: 'error',
      check: () => [makeDiagnostic({ severity: 'warn' })],
    };
    const engine = new LintEngine([rule]);

    const [diagnostic] = engine.lint('', 'test.ts');
    // Engine applies defaultSeverity — not the value the rule put in the diagnostic
    expect(diagnostic.severity).toBe('error');
  });

  it('returns empty array when no rules are registered', () => {
    const engine = new LintEngine([]);
    expect(engine.lint('const x = 1;', 'test.ts')).toHaveLength(0);
  });

  it('returns empty array when all rules emit no diagnostics', () => {
    const rule = makeRule('quiet-rule', []);
    const engine = new LintEngine([rule]);
    expect(engine.lint('const x = 1;', 'test.ts')).toHaveLength(0);
  });
});
