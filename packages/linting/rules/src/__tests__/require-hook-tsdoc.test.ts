import { describe, it, expect } from 'vitest';
import type { Diagnostic } from '@equinor/fusion-framework-lint-core';
import { requireHookTsDoc } from '../require-hook-tsdoc/index.js';

// ── Helpers ───────────────────────────────────────────────────────────────────

function lintTs(source: string): Diagnostic[] {
  return requireHookTsDoc.check(source, 'fixture.ts');
}

function lintTsx(source: string): Diagnostic[] {
  return requireHookTsDoc.check(source, 'fixture.tsx');
}

// ── Passing cases ─────────────────────────────────────────────────────────────

describe('require-hook-tsdoc — passing', () => {
  it('passes: arrow hook with TSDoc in .ts file', () => {
    expect(
      lintTs(`
/** Fetches paginated context data. */
export const useContextData = (): string[] => [];
`),
    ).toHaveLength(0);
  });

  it('passes: arrow hook with TSDoc in .tsx file', () => {
    expect(
      lintTsx(`
/** Returns modal open state. */
export const useModal = (): boolean => false;
`),
    ).toHaveLength(0);
  });

  it('passes: function expression hook with TSDoc', () => {
    expect(
      lintTs(`
/** Provides access to the current user. */
export const useCurrentUser = function (): string { return ''; };
`),
    ).toHaveLength(0);
  });

  it('passes: non-exported hook — exempt (not public API)', () => {
    expect(lintTs('const useInternal = () => null;')).toHaveLength(0);
  });

  it('passes: exported arrow with use prefix but lowercase third char — exempt (not a hook)', () => {
    // `used` starts with `use` but third char is lowercase, not a hook name
    expect(lintTs('export const used = () => true;')).toHaveLength(0);
  });

  it('passes: exported PascalCase arrow — exempt (handled by require-component-tsdoc)', () => {
    // PascalCase components are a different rule's responsibility
    expect(lintTs('export const UserCard = () => null;')).toHaveLength(0);
  });

  it('passes: exported const with use prefix that is not a function — exempt', () => {
    expect(lintTs('export const useCount = 42;')).toHaveLength(0);
  });

  it('passes: @inheritdoc TSDoc is accepted', () => {
    expect(
      lintTs(`
/** @inheritdoc */
export const useData = (): void => {};
`),
    ).toHaveLength(0);
  });

  it('passes: export function hook — not in scope (require-tsdoc covers this)', () => {
    // function declarations are handled by require-tsdoc, not this rule
    expect(lintTs('export function useData(): void {}')).toHaveLength(0);
  });

  it('passes: multi-hook file — all have TSDoc', () => {
    expect(
      lintTs(`
/** First hook. */
export const useAlpha = (): void => {};

/** Second hook. */
export const useBeta = (): void => {};
`),
    ).toHaveLength(0);
  });
});

// ── Failing cases ─────────────────────────────────────────────────────────────

describe('require-hook-tsdoc — failing', () => {
  it('fails: arrow hook without TSDoc in .ts file', () => {
    const diags = lintTs('export const useData = (): void => {};');
    expect(diags).toHaveLength(1);
    expect(diags[0].rule).toBe('require-hook-tsdoc');
    expect(diags[0].message).toContain('useData');
  });

  it('fails: arrow hook without TSDoc in .tsx file', () => {
    const diags = lintTsx('export const useModal = (): boolean => false;');
    expect(diags).toHaveLength(1);
    expect(diags[0].message).toContain('useModal');
  });

  it('fails: function expression hook without TSDoc', () => {
    const diags = lintTs('export const useUser = function (): string { return ""; };');
    expect(diags).toHaveLength(1);
    expect(diags[0].message).toContain('useUser');
  });

  it('fails: plain comment (not TSDoc) is not accepted', () => {
    const diags = lintTs(`
// Just a comment
export const useData = (): void => {};
`);
    expect(diags).toHaveLength(1);
  });

  it('fails: block comment not opening with /** is not accepted', () => {
    const diags = lintTs(`
/* Not TSDoc */
export const useData = (): void => {};
`);
    expect(diags).toHaveLength(1);
  });

  it('fails: multi-hook file — one missing TSDoc', () => {
    const diags = lintTs(`
/** Has TSDoc. */
export const useAlpha = (): void => {};

export const useBeta = (): void => {};
`);
    expect(diags).toHaveLength(1);
    expect(diags[0].message).toContain('useBeta');
  });

  it('fails: reports correct line number', () => {
    const source = `
const x = 1;
export const useData = (): void => {};
`;
    const diags = lintTs(source);
    expect(diags).toHaveLength(1);
    expect(diags[0].line).toBe(3);
  });

  it('fails: severity can be overridden to error', () => {
    const diags = requireHookTsDoc.check(
      'export const useData = (): void => {};',
      'fixture.ts',
      'error',
    );
    expect(diags[0].severity).toBe('error');
  });
});
