import { describe, it, expect } from 'vitest';
import { noTodoWithoutIssue } from '../no-todo-without-issue/index.js';
import type { Diagnostic } from '@equinor/fusion-framework-lint-core';

function lint(source: string): Diagnostic[] {
  return noTodoWithoutIssue.check(source, 'fixture.ts');
}

// ── Passing cases ─────────────────────────────────────────────────────────────

describe('no-todo-without-issue — passing', () => {
  it('passes: TODO with issue in parens', () => {
    expect(lint(`// TODO(#1234): remove this workaround`)).toHaveLength(0);
  });

  it('passes: FIXME with issue inline', () => {
    expect(lint(`// FIXME: #456 re-enable strict mode after migration`)).toHaveLength(0);
  });

  it('passes: HACK with issue reference', () => {
    expect(lint(`// HACK #789 — upstream bug, remove when fixed`)).toHaveLength(0);
  });

  it('passes: XXX with issue reference', () => {
    expect(lint(`// XXX(#42): temporary workaround`)).toHaveLength(0);
  });

  it('passes: regular comment without marker', () => {
    expect(lint(`// This is a normal explanatory comment`)).toHaveLength(0);
  });

  it('passes: block comment with issue ref', () => {
    expect(lint(`/* TODO(#99): clean this up */`)).toHaveLength(0);
  });
});

// ── Failing cases ─────────────────────────────────────────────────────────────

describe('no-todo-without-issue — failing', () => {
  it('fails: bare TODO without issue', () => {
    const diags = lint(`// TODO: remove this workaround`);
    expect(diags).toHaveLength(1);
    expect(diags[0].rule).toBe('no-todo-without-issue');
    expect(diags[0].message).toContain('TODO');
  });

  it('fails: FIXME without issue', () => {
    const diags = lint(`// FIXME: re-enable strict mode`);
    expect(diags).toHaveLength(1);
    expect(diags[0].message).toContain('FIXME');
  });

  it('fails: HACK without issue', () => {
    const diags = lint(`// HACK: bad workaround`);
    expect(diags).toHaveLength(1);
    expect(diags[0].message).toContain('HACK');
  });

  it('fails: XXX without issue', () => {
    expect(lint(`// XXX: needs refactor`)).toHaveLength(1);
  });

  it('fails: multiple untracked markers each flagged', () => {
    const source = `
// TODO: fix this
// FIXME: and this
`;
    expect(lint(source)).toHaveLength(2);
  });

  it('fails: default severity is warn', () => {
    const diags = lint(`// TODO: do something`);
    expect(diags[0].severity).toBe('warn');
  });
});
