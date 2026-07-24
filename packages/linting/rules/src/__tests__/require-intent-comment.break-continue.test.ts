import { describe, it, expect } from 'vitest';
import { requireIntentCommentBreakContinue } from '../require-intent-comment/break-continue.js';
import type { Diagnostic } from '@equinor/fusion-framework-lint-core';

function lint(source: string): Diagnostic[] {
  return requireIntentCommentBreakContinue.check(source, 'fixture.ts');
}

// ── Passing cases ─────────────────────────────────────────────────────────────

describe('require-intent-comment/break-continue — passing', () => {
  it('passes: break with preceding comment in loop', () => {
    const source = `
for (const item of items) {
  process(item);
  // Only process the first item
  break;
}
`;
    expect(lint(source)).toHaveLength(0);
  });

  it('passes: continue with preceding comment in loop', () => {
    const source = `
for (const item of items) {
  if (!item.isValid) {
    // Skip invalid items
    continue;
  }
  process(item);
}
`;
    expect(lint(source)).toHaveLength(0);
  });

  it('passes: labeled break with preceding comment', () => {
    const source = `
outer: for (const x of xs) {
  for (const y of ys) {
    if (x.id === y.id) {
      // Match found — exit both loops
      break outer;
    }
  }
}
`;
    expect(lint(source)).toHaveLength(0);
  });

  it('passes: break in switch case — always exempt', () => {
    const source = `
switch (action) {
  case 'start':
    doStart();
    break;
  case 'stop':
    doStop();
    break;
}
`;
    expect(lint(source)).toHaveLength(0);
  });

  it('passes: braced switch case break — also exempt', () => {
    const source = `
switch (x) {
  case 'a': {
    doSomething();
    break;
  }
}
`;
    expect(lint(source)).toHaveLength(0);
  });

  it('passes: single-line if consequence — covered by flow rule, not double-reported', () => {
    // if (cond) continue; — parent of continue is if_statement, not statement_block
    const source = `
for (const item of items) {
  if (!item) continue;
  process(item);
}
`;
    expect(lint(source)).toHaveLength(0);
  });

  it('passes: single-line break as if consequence', () => {
    const source = `
for (const item of items) {
  if (item.done) break;
}
`;
    expect(lint(source)).toHaveLength(0);
  });
});

// ── Failing cases ─────────────────────────────────────────────────────────────

describe('require-intent-comment/break-continue — failing', () => {
  it('fails: break in loop body with no comment', () => {
    const source = `
for (const item of items) {
  process(item);
  break;
}
`;
    const diags = lint(source);
    expect(diags).toHaveLength(1);
    expect(diags[0].rule).toBe('require-intent-comment/break-continue');
    expect(diags[0].message).toContain('`break`');
  });

  it('fails: continue in loop body with no comment', () => {
    const source = `
for (const item of items) {
  if (!item.isValid) {
    continue;
  }
  process(item);
}
`;
    const diags = lint(source);
    expect(diags).toHaveLength(1);
    expect(diags[0].message).toContain('`continue`');
  });

  it('fails: labeled break with no comment', () => {
    const source = `
outer: for (const x of xs) {
  for (const y of ys) {
    if (x.id === y.id) {
      break outer;
    }
  }
}
`;
    const diags = lint(source);
    expect(diags).toHaveLength(1);
    expect(diags[0].message).toContain("'outer'");
  });

  it('fails: while loop break with no comment', () => {
    const source = `
while (running) {
  const result = poll();
  break;
}
`;
    expect(lint(source)).toHaveLength(1);
  });

  it('fails: labeled break out of a labeled block (not a loop) with no comment', () => {
    // Labeled breaks are always checked, even when they exit a non-loop labeled
    // block rather than a loop or switch — see rule TSDoc.
    const source = `
outer: {
  if (cond) {
    break outer;
  }
}
`;
    const diags = lint(source);
    expect(diags).toHaveLength(1);
    expect(diags[0].message).toContain("'outer'");
  });

  it('fails: multiple violations each flagged', () => {
    const source = `
for (const x of xs) {
  if (!x.ready) {
    continue;
  }
  process(x);
  break;
}
`;
    expect(lint(source)).toHaveLength(2);
  });

  it('fails: default severity is warn', () => {
    const source = `
for (const item of items) {
  break;
}
`;
    expect(lint(source)[0].severity).toBe('warn');
  });
});
