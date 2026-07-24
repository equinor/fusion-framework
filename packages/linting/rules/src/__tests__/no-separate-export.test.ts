import { describe, it, expect } from 'vitest';
import { noSeparateExport } from '../no-separate-export/index.js';
import type { Diagnostic } from '@equinor/fusion-framework-lint-core';

function lint(source: string): Diagnostic[] {
  return noSeparateExport.check(source, 'fixture.ts');
}

// ── Passing cases ─────────────────────────────────────────────────────────────

describe('no-separate-export — passing', () => {
  it('passes: inline export function', () => {
    const source = `export function processItem(item: Item): Result { return item; }`;
    expect(lint(source)).toHaveLength(0);
  });

  it('passes: inline export const', () => {
    const source = `export const DEFAULT_TIMEOUT = 5000;`;
    expect(lint(source)).toHaveLength(0);
  });

  it('passes: inline export class', () => {
    const source = `export class MyService { run() {} }`;
    expect(lint(source)).toHaveLength(0);
  });

  it('passes: re-export from another module', () => {
    const source = `export { foo, bar } from './utils.js';`;
    expect(lint(source)).toHaveLength(0);
  });

  it('passes: re-export with rename from another module', () => {
    const source = `export { default as createApp } from './app.js';`;
    expect(lint(source)).toHaveLength(0);
  });

  it('passes: export type (type-only)', () => {
    const source = `export type { Config } from './types.js';`;
    expect(lint(source)).toHaveLength(0);
  });
});

// ── Failing cases ─────────────────────────────────────────────────────────────

describe('no-separate-export — failing', () => {
  it('fails: export { foo } without from', () => {
    const source = `
function processItem(item: Item): Result { return item; }
export { processItem };
`;
    const diags = lint(source);
    expect(diags).toHaveLength(1);
    expect(diags[0]?.rule).toBe('no-separate-export');
    expect(diags[0]?.message).toContain('processItem');
  });

  it('fails: export { a, b } local', () => {
    const source = `
const a = 1;
const b = 2;
export { a, b };
`;
    const diags = lint(source);
    expect(diags).toHaveLength(1);
    expect(diags[0]?.message).toContain('a');
  });

  it('fails: mixed inline + separate', () => {
    const source = `
export function foo() {}
function bar() {}
export { bar };
`;
    const diags = lint(source);
    expect(diags).toHaveLength(1);
    expect(diags[0]?.message).toContain('bar');
  });
});
