import { describe, it, expect } from 'vitest';
import type { Diagnostic } from '@equinor/fusion-framework-lint-core';
import { requireComponentTsDoc } from '../require-component-tsdoc/index.js';

// ── Helpers ───────────────────────────────────────────────────────────────────

function lint(source: string, file = 'fixture.tsx'): Diagnostic[] {
  return requireComponentTsDoc.check(source, file);
}

// ── Passing cases ─────────────────────────────────────────────────────────────

describe('require-component-tsdoc — passing', () => {
  it('passes: arrow function component with TSDoc', () => {
    expect(
      lint(`
/** Displays user identity. */
export const UserCard = ({ user }: Props): JSX.Element => <div>{user.name}</div>;
`),
    ).toHaveLength(0);
  });

  it('passes: function expression component with TSDoc', () => {
    expect(
      lint(`
/** Renders a loading indicator. */
export const Spinner = function (): JSX.Element { return <div />; };
`),
    ).toHaveLength(0);
  });

  it('passes: non-PascalCase exported arrow (hook / utility) — exempt', () => {
    // hooks and utilities follow camelCase; they are not components
    expect(
      lint(`
export const useData = () => ({ data: null });
`),
    ).toHaveLength(0);
  });

  it('passes: non-exported PascalCase arrow — exempt (not part of public API)', () => {
    expect(
      lint(`
const InternalHelper = () => null;
`),
    ).toHaveLength(0);
  });

  it('passes: exported PascalCase plain value (not a function) — exempt', () => {
    expect(
      lint(`
export const DEFAULT_CONFIG = { timeout: 5000 };
`),
    ).toHaveLength(0);
  });

  it('passes: ignored on .ts file regardless of PascalCase name', () => {
    expect(
      requireComponentTsDoc.check('export const Foo = () => null;', 'fixture.ts'),
    ).toHaveLength(0);
  });

  it('passes: @inheritdoc-style TSDoc is accepted', () => {
    expect(
      lint(`
/** @inheritdoc */
export const UserCard = (): JSX.Element => <div />;
`),
    ).toHaveLength(0);
  });

  it('passes: multi-component file — all have TSDoc', () => {
    expect(
      lint(`
/** First component. */
export const Alpha = (): JSX.Element => <div />;

/** Second component. */
export const Beta = (): JSX.Element => <span />;
`),
    ).toHaveLength(0);
  });
});

// ── Failing cases ─────────────────────────────────────────────────────────────

describe('require-component-tsdoc — failing', () => {
  it('fails: arrow function component without TSDoc', () => {
    const diags = lint('export const UserCard = (): JSX.Element => <div />;');
    expect(diags).toHaveLength(1);
    expect(diags[0].rule).toBe('require-component-tsdoc');
    expect(diags[0].message).toContain('UserCard');
  });

  it('fails: function expression component without TSDoc', () => {
    const diags = lint('export const Spinner = function (): JSX.Element { return <div />; };');
    expect(diags).toHaveLength(1);
    expect(diags[0].message).toContain('Spinner');
  });

  it('fails: plain comment (not TSDoc) is not accepted', () => {
    const diags = lint(`
// Just a regular comment
export const UserCard = (): JSX.Element => <div />;
`);
    expect(diags).toHaveLength(1);
  });

  it('fails: block comment not opening with /** is not accepted', () => {
    const diags = lint(`
/* Not TSDoc */
export const UserCard = (): JSX.Element => <div />;
`);
    expect(diags).toHaveLength(1);
  });

  it('fails: multi-component file — one missing TSDoc', () => {
    const diags = lint(`
/** Has TSDoc. */
export const Alpha = (): JSX.Element => <div />;

export const Beta = (): JSX.Element => <span />;
`);
    expect(diags).toHaveLength(1);
    expect(diags[0].message).toContain('Beta');
  });

  it('fails: reports correct line number', () => {
    const source = `
const x = 1;
export const Panel = (): JSX.Element => <div />;
`;
    const diags = lint(source);
    expect(diags).toHaveLength(1);
    expect(diags[0].line).toBe(3);
  });

  it('fails: severity can be overridden to error', () => {
    const diags = requireComponentTsDoc.check(
      'export const Card = (): JSX.Element => <div />;',
      'fixture.tsx',
      'error',
    );
    expect(diags[0].severity).toBe('error');
  });
});
