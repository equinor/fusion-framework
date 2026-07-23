import { describe, it, expect } from 'vitest';
import { requireIntentCommentTypeAssertion } from '../require-intent-comment/type-assertion.js';
import type { Diagnostic } from '@equinor/fusion-framework-lint-core';

function lint(source: string): Diagnostic[] {
  return requireIntentCommentTypeAssertion.check(source, 'fixture.ts');
}

// ── Passing cases ─────────────────────────────────────────────────────────────

describe('require-intent-comment/type-assertion — passing', () => {
  it('passes: normal narrowing cast is not flagged', () => {
    expect(lint(`const el = event.target as HTMLInputElement;`)).toHaveLength(0);
  });

  it('passes: as unknown alone is not flagged', () => {
    // widening to unknown is safe by definition
    expect(lint(`const x = value as unknown;`)).toHaveLength(0);
  });

  it('passes: as any with preceding comment', () => {
    const source = `
// Legacy API returns an untyped response object; cast until types are added
const data = (response as any).payload;
`;
    expect(lint(source)).toHaveLength(0);
  });

  it('passes: as unknown as T with preceding comment', () => {
    const source = `
// The external API guarantees this is always an AppConfig at runtime
const config = rawData as unknown as AppConfig;
`;
    expect(lint(source)).toHaveLength(0);
  });

  it('passes: as unknown as T in return with preceding comment', () => {
    const source = `
function coerce(x: unknown) {
  // Safe: callers must ensure x is always AppConfig
  return x as unknown as AppConfig;
}
`;
    expect(lint(source)).toHaveLength(0);
  });
});

// ── Failing cases ─────────────────────────────────────────────────────────────

describe('require-intent-comment/type-assertion — failing', () => {
  it('fails: as any without comment', () => {
    const source = `const value = (input as any).field;`;
    const diags = lint(source);
    expect(diags).toHaveLength(1);
    expect(diags[0].rule).toBe('require-intent-comment/type-assertion');
    expect(diags[0].message).toContain("'as any'");
  });

  it('fails: as unknown as T without comment', () => {
    const source = `const config = rawData as unknown as AppConfig;`;
    const diags = lint(source);
    expect(diags).toHaveLength(1);
    expect(diags[0].message).toContain('as unknown as');
  });

  it('fails: as any in assignment without comment', () => {
    const source = `
const x = 1;
const y = (x as any).toString();
`;
    expect(lint(source)).toHaveLength(1);
  });

  it('fails: multiple unsafe casts each flagged', () => {
    const source = `
const a = foo as unknown as A;
const b = bar as any;
`;
    expect(lint(source)).toHaveLength(2);
  });

  it('fails: default severity is error', () => {
    const diags = lint(`const x = foo as any;`);
    expect(diags[0].severity).toBe('error');
  });
});
