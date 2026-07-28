import { describe, it, expect } from 'vitest';
import { requireIntentCommentRxjs } from '../require-intent-comment/rxjs.js';
import type { Diagnostic } from '@equinor/fusion-framework-lint-core';

function lint(source: string): Diagnostic[] {
  return requireIntentCommentRxjs().check(source, { filePath: 'fixture.ts' });
}

// ── Passing cases ─────────────────────────────────────────────────────────────

describe('require-intent-comment/rxjs — passing', () => {
  it('passes: expression_statement pipe with preceding comment', () => {
    const source = `
// Debounce input and drop stale requests before each search call
source$.pipe(debounceTime(300), switchMap(search)).subscribe();
`;
    expect(lint(source)).toHaveLength(0);
  });

  it('passes: lexical_declaration pipe with preceding comment', () => {
    const source = `
// Combine latest state slices for the view model
const vm$ = combineLatest([user$, settings$]).pipe(map(buildViewModel));
`;
    expect(lint(source)).toHaveLength(0);
  });

  it('passes: multiple pipes all preceded by comments', () => {
    const source = `
// Filter only active projects
const active$ = projects$.pipe(filter(p => p.isActive));
// Map to display labels
const labels$ = active$.pipe(map(p => p.name));
`;
    expect(lint(source)).toHaveLength(0);
  });

  it('passes: non-pipe member call — not flagged', () => {
    expect(lint(`arr.map(x => x + 1);`)).toHaveLength(0);
  });

  it('passes: return_statement pipe with preceding comment', () => {
    const source = `
function build() {
  return source$
    // Debounce input and drop stale requests before each search call
    .pipe(debounceTime(300), switchMap(search));
}
`;
    expect(lint(source)).toHaveLength(0);
  });

  it('passes: inline chain comment immediately before .pipe()', () => {
    const source = `
const result$ = source$
  // Debounce input and drop stale requests before each search call
  .pipe(debounceTime(300), switchMap(search));
`;
    expect(lint(source)).toHaveLength(0);
  });

  it('passes: concise arrow-function body pipe with preceding comment', () => {
    const source = `
export const mapAction =
  (type, fn) =>
  (source) =>
    // Narrow the stream to the requested action type, then map its payload
    source.pipe(filterAction(type), map(fn));
`;
    expect(lint(source)).toHaveLength(0);
  });
});

// ── Failing cases ─────────────────────────────────────────────────────────────

describe('require-intent-comment/rxjs — failing', () => {
  it('fails: expression_statement pipe with no comment', () => {
    const source = `source$.pipe(debounceTime(300)).subscribe();`;
    const diags = lint(source);
    expect(diags).toHaveLength(1);
    expect(diags[0].rule).toBe('require-intent-comment/rxjs');
    expect(diags[0].message).toContain('.pipe()');
  });

  it('fails: lexical_declaration pipe with no comment', () => {
    const source = `const value$ = source$.pipe(map(x => x * 2));`;
    expect(lint(source)).toHaveLength(1);
  });

  it('fails: multiple uncommented pipes each flagged', () => {
    const source = `
const a$ = x$.pipe(map(toA));
const b$ = y$.pipe(filter(isB));
`;
    expect(lint(source)).toHaveLength(2);
  });

  it('fails: default severity is warn', () => {
    const diags = lint(`source$.pipe(tap(log)).subscribe();`);
    expect(diags[0].severity).toBe('warn');
  });

  it('fails: concise arrow-function body pipe with no comment', () => {
    const source = `
export const mapAction =
  (type, fn) =>
  (source) =>
    source.pipe(filterAction(type), map(fn));
`;
    expect(lint(source)).toHaveLength(1);
  });
});
