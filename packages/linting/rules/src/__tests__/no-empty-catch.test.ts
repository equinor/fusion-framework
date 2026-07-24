import { describe, it, expect } from 'vitest';
import { noEmptyCatch } from '../no-empty-catch/index.js';
import type { Diagnostic } from '@equinor/fusion-framework-lint-core';

function lint(source: string): Diagnostic[] {
  return noEmptyCatch.check(source, 'fixture.ts');
}

// ── Passing cases ─────────────────────────────────────────────────────────────

describe('no-empty-catch — passing', () => {
  it('passes: catch with real error handling', () => {
    const source = `
try {
  await loadConfig();
} catch (e) {
  throw new Error(\`Config load failed: \${e.message}\`);
}
`;
    expect(lint(source)).toHaveLength(0);
  });

  it('passes: empty catch with explanatory comment', () => {
    const source = `
try {
  await fs.unlink(lockFile);
} catch {
  // Lock file may not exist on first run — safe to ignore
}
`;
    expect(lint(source)).toHaveLength(0);
  });

  it('passes: console-only catch with explanatory comment', () => {
    const source = `
try {
  analytics.track(event);
} catch (e) {
  // Analytics failures must not crash the app — log and continue
  console.error('Analytics error', e);
}
`;
    expect(lint(source)).toHaveLength(0);
  });

  it('passes: catch that reassigns an error variable', () => {
    const source = `
try {
  result = await fetch(url);
} catch (e) {
  lastError = e;
}
`;
    expect(lint(source)).toHaveLength(0);
  });
});

// ── Failing cases ─────────────────────────────────────────────────────────────

describe('no-empty-catch — failing', () => {
  it('fails: completely empty catch block', () => {
    const source = `
try {
  await loadConfig();
} catch (e) {}
`;
    const diags = lint(source);
    expect(diags).toHaveLength(1);
    expect(diags[0].rule).toBe('no-empty-catch');
    expect(diags[0].message).toContain('silently swallows');
  });

  it('fails: catch with only console.error', () => {
    const source = `
try {
  await loadConfig();
} catch (e) {
  console.error(e);
}
`;
    expect(lint(source)).toHaveLength(1);
  });

  it('fails: catch with only console.log', () => {
    const source = `
try {
  doSomething();
} catch (e) {
  console.log('failed', e);
}
`;
    expect(lint(source)).toHaveLength(1);
  });

  it('fails: catch with only console.warn', () => {
    const source = `
try {
  doSomething();
} catch (e) {
  console.warn(e);
}
`;
    expect(lint(source)).toHaveLength(1);
  });

  it('fails: multiple undocumented catches each flagged', () => {
    const source = `
try { await a(); } catch {}
try { await b(); } catch (e) { console.error(e); }
`;
    expect(lint(source)).toHaveLength(2);
  });

  it('fails: default severity is error', () => {
    const diags = lint(`try { x(); } catch {}`);
    expect(diags[0].severity).toBe('error');
  });
});
