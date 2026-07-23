import { describe, it, expect } from 'vitest';
import { requireIntentCommentFlow } from '../require-intent-comment/flow.js';
import type { Diagnostic } from '@equinor/fusion-framework-lint-core';

function lint(source: string): Diagnostic[] {
  return requireIntentCommentFlow.check(source, 'fixture.ts');
}

function lineNumbers(diagnostics: Diagnostic[]): number[] {
  // Extract just the line number from each diagnostic for compact assertion
  const lines = diagnostics.map((d) => d.line);
  return lines;
}

// ── Pass cases ────────────────────────────────────────────────────────────────

describe('require-intent-comment/flow — passing cases', () => {
  it('passes: if_statement with line comment immediately before', () => {
    const source = `
function example() {
  // only run for authenticated users
  if (user.isAuthenticated) {
    return 'welcome';
  }
}
`;
    expect(lint(source)).toHaveLength(0);
  });

  it('passes: if_statement with block comment immediately before', () => {
    const source = `
function example() {
  /* guard: prevent double-submit */
  if (isSubmitting) return;
}
`;
    expect(lint(source)).toHaveLength(0);
  });

  it('passes: for_statement with comment', () => {
    const source = `
// iterate over all registered handlers
for (let i = 0; i < handlers.length; i++) {
  handlers[i]();
}
`;
    expect(lint(source)).toHaveLength(0);
  });

  it('passes: while_statement with comment', () => {
    const source = `
function drain() {
  // keep reading until the buffer is empty
  while (buffer.length > 0) {
    process(buffer.shift());
  }
}
`;
    expect(lint(source)).toHaveLength(0);
  });

  it('passes: for_of_statement with comment', () => {
    const source = `
// apply each middleware in registration order
for (const mw of middlewares) {
  mw(ctx);
}
`;
    expect(lint(source)).toHaveLength(0);
  });

  it('passes: for_in_statement with comment', () => {
    const source = `
// copy only own enumerable properties
for (const key in source) {
  target[key] = source[key];
}
`;
    expect(lint(source)).toHaveLength(0);
  });

  it('passes: nested if — both levels have comments', () => {
    const source = `
function process(user) {
  // guard: skip inactive accounts
  if (user.active) {
    // only admins can access this path
    if (user.role === 'admin') {
      doAdminThing();
    }
  }
}
`;
    expect(lint(source)).toHaveLength(0);
  });
});

// ── Fail cases ────────────────────────────────────────────────────────────────

describe('require-intent-comment/flow — failing cases', () => {
  it('fails: if_statement with no preceding comment', () => {
    const source = `
function example() {
  if (user.isAuthenticated) {
    return 'welcome';
  }
}
`;
    const diagnostics = lint(source);
    expect(diagnostics).toHaveLength(1);
    expect(diagnostics[0].rule).toBe('require-intent-comment/flow');
    expect(diagnostics[0].severity).toBe('warn');
    expect(diagnostics[0].line).toBe(3);
  });

  it('fails: for_statement with no preceding comment', () => {
    const source = `
for (let i = 0; i < 10; i++) {
  doWork(i);
}
`;
    expect(lineNumbers(lint(source))).toEqual([2]);
  });

  it('fails: while_statement with no preceding comment', () => {
    const source = `
while (running) {
  tick();
}
`;
    expect(lint(source)).toHaveLength(1);
  });

  it('fails: for_of_statement with no preceding comment', () => {
    const source = `
for (const item of items) {
  process(item);
}
`;
    expect(lint(source)).toHaveLength(1);
  });

  it('fails: for_in_statement with no preceding comment', () => {
    const source = `
for (const key in obj) {
  copy[key] = obj[key];
}
`;
    expect(lint(source)).toHaveLength(1);
  });

  it('fails: multiple missing comments produce multiple diagnostics', () => {
    const source = `
if (a) { doA(); }
if (b) { doB(); }
if (c) { doC(); }
`;
    expect(lint(source)).toHaveLength(3);
  });
});

// ── Edge cases ────────────────────────────────────────────────────────────────

describe('require-intent-comment/flow — edge cases', () => {
  it('edge: first statement in function with comment passes', () => {
    const source = `
function check(x: number) {
  // x must be positive for downstream math to work
  if (x <= 0) throw new Error('x must be positive');
}
`;
    expect(lint(source)).toHaveLength(0);
  });

  it('edge: outer if commented, inner if not — one diagnostic', () => {
    const source = `
function process(user) {
  // guard: skip inactive accounts
  if (user.active) {
    if (user.role === 'admin') {
      doAdminThing();
    }
  }
}
`;
    expect(lint(source)).toHaveLength(1);
  });

  it('edge: statement between comment and if breaks the link', () => {
    const source = `
function example() {
  // this comment belongs to the const, not the if
  const x = getValue();
  if (x > 0) {
    process(x);
  }
}
`;
    expect(lint(source)).toHaveLength(1);
  });

  it('edge: do_statement without comment fails', () => {
    const source = `
do {
  step();
} while (condition);
`;
    expect(lint(source)).toHaveLength(1);
  });

  it('edge: do_statement with comment passes', () => {
    const source = `
// run at least once to initialise state
do {
  step();
} while (condition);
`;
    expect(lint(source)).toHaveLength(0);
  });

  it('edge: empty source produces no diagnostics', () => {
    expect(lint('')).toHaveLength(0);
  });

  it('edge: source with only comments produces no diagnostics', () => {
    expect(lint('// just a comment\n/* another */\n')).toHaveLength(0);
  });
});
