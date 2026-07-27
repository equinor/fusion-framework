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

  it('passes: re-export of a named import', () => {
    const source = `
import { Foo } from './foo.js';
export { Foo };
`;
    expect(lint(source)).toHaveLength(0);
  });

  it('passes: re-export of a type-only named import', () => {
    const source = `
import { type Foo } from './foo.js';
export type { Foo };
`;
    expect(lint(source)).toHaveLength(0);
  });

  it('passes: re-export of an aliased import under its local name', () => {
    const source = `
import { Foo as Bar } from './foo.js';
export { Bar };
`;
    expect(lint(source)).toHaveLength(0);
  });

  it('passes: re-export of a default import', () => {
    const source = `
import Foo from './foo.js';
export { Foo };
`;
    expect(lint(source)).toHaveLength(0);
  });

  it('passes: re-export of a namespace import', () => {
    const source = `
import * as NS from './foo.js';
export { NS };
`;
    expect(lint(source)).toHaveLength(0);
  });

  it('passes: re-export of multiple imports', () => {
    const source = `
import { Foo, Bar } from './foo.js';
export { Foo, Bar };
`;
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

  it('fails: mixed re-exported import + locally defined symbol', () => {
    const source = `
import { Foo } from './foo.js';
function bar() {}
export { Foo, bar };
`;
    const diags = lint(source);
    expect(diags).toHaveLength(1);
    // Only the locally defined symbol should be flagged, not the re-exported import
    expect(diags[0]?.message).toContain('bar');
    expect(diags[0]?.message).not.toContain('Foo');
  });
});
