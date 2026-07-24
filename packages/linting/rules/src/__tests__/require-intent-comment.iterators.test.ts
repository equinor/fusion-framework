import { describe, it, expect } from 'vitest';
import { requireIntentCommentIterators } from '../require-intent-comment/iterators.js';
import type { Diagnostic } from '@equinor/fusion-framework-lint-core';

function lint(source: string): Diagnostic[] {
  return requireIntentCommentIterators.check(source, 'fixture.ts');
}

// ── Pass cases ────────────────────────────────────────────────────────────────

describe('require-intent-comment/iterators — passing cases', () => {
  it('passes: forEach with line comment immediately before', () => {
    const source = `
// notify every subscriber of the state change
subscribers.forEach((sub) => sub.notify(state));
`;
    expect(lint(source)).toHaveLength(0);
  });

  it('passes: map with comment', () => {
    const source = `
// transform raw DTOs into view models
const views = items.map((item) => toViewModel(item));
`;
    expect(lint(source)).toHaveLength(0);
  });

  it('passes: filter with comment', () => {
    const source = `
// exclude items that have already been processed
const pending = queue.filter((item) => !item.done);
`;
    expect(lint(source)).toHaveLength(0);
  });

  it('passes: reduce with comment', () => {
    const source = `
// accumulate total cost across all line items
const total = items.reduce((sum, item) => sum + item.price, 0);
`;
    expect(lint(source)).toHaveLength(0);
  });

  it('passes: some with comment', () => {
    const source = `
// check if any item is overdue
const hasOverdue = items.some((item) => item.isOverdue);
`;
    expect(lint(source)).toHaveLength(0);
  });
});

// ── Fail cases ────────────────────────────────────────────────────────────────

describe('require-intent-comment/iterators — failing cases', () => {
  it('fails: forEach with no preceding comment', () => {
    const source = `
items.forEach((item) => {
  process(item);
});
`;
    const diagnostics = lint(source);
    expect(diagnostics).toHaveLength(1);
    expect(diagnostics[0].rule).toBe('require-intent-comment/iterators');
    expect(diagnostics[0].severity).toBe('warn');
  });

  it('fails: map with no preceding comment', () => {
    const source = `
const ids = items.map((item) => item.id);
`;
    expect(lint(source)).toHaveLength(1);
  });

  it('fails: filter with no preceding comment', () => {
    const source = `
const active = users.filter((u) => u.active);
`;
    expect(lint(source)).toHaveLength(1);
  });

  it('fails: find with no preceding comment', () => {
    const source = `
const match = items.find((item) => item.id === id);
`;
    expect(lint(source)).toHaveLength(1);
  });
});

// ── Edge cases ────────────────────────────────────────────────────────────────

describe('require-intent-comment/iterators — edge cases', () => {
  it('edge: statement between comment and forEach breaks the link', () => {
    const source = `
// this comment belongs to the const
const list = getList();
list.forEach((item) => process(item));
`;
    expect(lint(source)).toHaveLength(1);
  });

  it('edge: empty source produces no diagnostics', () => {
    expect(lint('')).toHaveLength(0);
  });

  it('edge: non-iterator method call without comment does not trigger', () => {
    // 'push', 'pop', etc. are not in the iterator list
    const source = `
items.push(newItem);
`;
    expect(lint(source)).toHaveLength(0);
  });
});
