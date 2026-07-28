import { describe, it, expect } from 'vitest';
import { singleExportPerFile } from '../single-export-per-file/index.js';
import type { Diagnostic, Rule } from '@equinor/fusion-framework-lint-core';

function lint(source: string, file = 'fixture.ts', rule: Rule = singleExportPerFile()): Diagnostic[] {
  // mirror the engine: skip `check` entirely when `match` opts the file out
  if (rule.match && !rule.match(file)) return [];
  return rule.check(source, { filePath: file });
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

  it('passes: export type + export enum (enum does not count)', () => {
    const source = `
export type Config = { level: LogLevel };
export enum LogLevel { Info, Error }
`;
    expect(lint(source)).toHaveLength(0);
  });

  it('passes: export enum + export const (enum does not count)', () => {
    const source = `
export enum LogLevel { Info, Error }
export const DEFAULT_LEVEL = LogLevel.Info;
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
    const rule = singleExportPerFile({ match: { exclude: ['barrel.ts'] } });
    const source = `
export function foo() {}
export function bar() {}
`;
    expect(lint(source, '/src/barrel.ts', rule)).toHaveLength(0);
  });

  it('passes: multiple exports matching a glob-style exclude pattern', () => {
    const rule = singleExportPerFile({ match: { exclude: ['*.schemas.ts'] } });
    const source = `
export const fooSchema = {};
export const barSchema = {};
`;
    expect(lint(source, '/src/bookmark.schemas.ts', rule)).toHaveLength(0);
  });

  it('passes: multiple exports matching a glob-style suffix pattern', () => {
    const rule = singleExportPerFile({ match: { exclude: ['*-module.ts'] } });
    const source = `
export const module = {};
export const enableModule = () => {};
`;
    expect(lint(source, '/src/bookmark-module.ts', rule)).toHaveLength(0);
  });

  it('fails: glob-style pattern does not match a non-conforming basename', () => {
    const rule = singleExportPerFile({ match: { exclude: ['*.schemas.ts'] } });
    const source = `
export const fooSchema = {};
export const barSchema = {};
`;
    expect(lint(source, '/src/bookmark.schema.ts', rule)).toHaveLength(1);
  });

  it('passes: custom match.fn overrides match.exclude entirely', () => {
    const rule = singleExportPerFile({
      match: {
        exclude: ['*.schemas.ts'],
        fn: (filePath: string) => !filePath.endsWith('.generated.ts'),
      },
    });
    const source = `
export function foo() {}
export function bar() {}
`;
    // '.generated.ts' isn't in the exclude list, but the custom fn exempts it
    expect(lint(source, '/src/fixture.generated.ts', rule)).toHaveLength(0);
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
