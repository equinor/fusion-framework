import { describe, it, expect } from 'vitest';
import { requireIntentCommentObjectMerge } from '../require-intent-comment/object-merge.js';
import type { Diagnostic } from '@equinor/fusion-framework-lint-core';

function lint(source: string): Diagnostic[] {
  return requireIntentCommentObjectMerge().check(source, { filePath: 'fixture.ts' });
}

// ── Passing cases ─────────────────────────────────────────────────────────────

describe('require-intent-comment/object-merge — passing', () => {
  it('passes: multi-source Object.assign() with preceding comment', () => {
    const source = `
// Environment overrides win over defaults, which win over hardcoded fallbacks
const config = Object.assign({}, fallbacks, defaults, env);
`;
    expect(lint(source)).toHaveLength(0);
  });

  it('passes: multi-spread object literal with preceding comment', () => {
    const source = `
// Later plugins override earlier ones on key conflicts
const merged = { ...base, ...override };
`;
    expect(lint(source)).toHaveLength(0);
  });

  it('passes: multi-spread array literal with preceding comment', () => {
    const source = `
// Concatenate both lists, keeping duplicates for now
const combined = [...listA, ...listB];
`;
    expect(lint(source)).toHaveLength(0);
  });

  it('passes: two-argument Object.assign() is a clone/patch, not flagged', () => {
    expect(lint(`const copy = Object.assign({}, source);`)).toHaveLength(0);
  });

  it('passes: single spread with explicit property overrides is not flagged', () => {
    expect(lint(`const next = { ...state, enabled: true };`)).toHaveLength(0);
  });

  it('passes: single spread array literal is not flagged', () => {
    expect(lint(`const copy = [...items];`)).toHaveLength(0);
  });

  it('passes: return_statement merge with inline chain-independent comment above return', () => {
    const source = `
function build() {
  // Config precedence: env > defaults > fallbacks
  return Object.assign({}, fallbacks, defaults, env);
}
`;
    expect(lint(source)).toHaveLength(0);
  });
});

// ── Failing cases ─────────────────────────────────────────────────────────────

describe('require-intent-comment/object-merge — failing', () => {
  it('fails: multi-source Object.assign() with no comment', () => {
    const diags = lint(`const config = Object.assign({}, fallbacks, defaults, env);`);
    expect(diags).toHaveLength(1);
    expect(diags[0].rule).toBe('require-intent-comment/object-merge');
    expect(diags[0].message).toContain('Object.assign()');
  });

  it('fails: multi-spread object literal with no comment', () => {
    const diags = lint(`const merged = { ...base, ...override };`);
    expect(diags).toHaveLength(1);
    expect(diags[0].message).toContain('Spreading multiple sources');
  });

  it('fails: multi-spread array literal with no comment', () => {
    expect(lint(`const combined = [...listA, ...listB];`)).toHaveLength(1);
  });

  it('fails: default severity is warn', () => {
    const diags = lint(`const merged = { ...base, ...override };`);
    expect(diags[0].severity).toBe('warn');
  });
});
