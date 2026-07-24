import { describe, it, expect } from 'vitest';
import { singleExportPerFile, createSingleExportPerFile } from '../single-export-per-file/index.js';
import type { Diagnostic } from '@equinor/fusion-framework-lint-core';

function lint(source: string, file = 'fixture.ts'): Diagnostic[] {
  return singleExportPerFile.check(source, file);
}

// ── Passing cases ─────────────────────────────────────────────────────────────

describe('single-export-per-file — passing', () => {
  it('passes: single export function', () => {
    const source = `export function processItem(item: Item): Result { return item; }`;
    expect(lint(source)).toHaveLength(0);
  });

  it('passes: single export const', () => {
    const source = `export const DEFAULT_TIMEOUT = 5000;`;
    expect(lint(source)).toHaveLength(0);
  });

  it('passes: export + export type (type does not count)', () => {
    const source = `
export type Config = { timeout: number };
export function createConfig(): Config { return { timeout: 5000 }; }
`;
    expect(lint(source)).toHaveLength(0);
  });

  it('passes: export + re-export from another module', () => {
    const source = `
export function foo() {}
export { bar } from './other.js';
`;
    expect(lint(source)).toHaveLength(0);
  });

  it('passes: multiple exports in index.ts (barrel)', () => {
    const source = `
export function foo() {}
export function bar() {}
export const baz = 1;
`;
    expect(lint(source, '/src/index.ts')).toHaveLength(0);
  });

  it('passes: multiple exports in custom-allowed file', () => {
    const rule = createSingleExportPerFile({ allowMultipleIn: ['barrel.ts'] });
    const source = `
export function foo() {}
export function bar() {}
`;
    expect(rule.check(source, '/src/barrel.ts')).toHaveLength(0);
  });
});

// ── Failing cases ─────────────────────────────────────────────────────────────

describe('single-export-per-file — failing', () => {
  it('fails: two exported functions', () => {
    const source = `
export function foo() {}
export function bar() {}
`;
    const diags = lint(source);
    expect(diags).toHaveLength(1);
    expect(diags[0]?.rule).toBe('single-export-per-file');
    expect(diags[0]?.message).toContain('bar');
  });

  it('fails: three exports — reports two violations', () => {
    const source = `
export function a() {}
export function b() {}
export function c() {}
`;
    const diags = lint(source);
    expect(diags).toHaveLength(2);
  });

  it('fails: export function + export const', () => {
    const source = `
export function createService() {}
export const DEFAULT_OPTIONS = {};
`;
    const diags = lint(source);
    expect(diags).toHaveLength(1);
    expect(diags[0]?.message).toContain('DEFAULT_OPTIONS');
  });
});
