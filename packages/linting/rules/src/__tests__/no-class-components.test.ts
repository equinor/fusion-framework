import { describe, it, expect } from 'vitest';
import { noClassComponents } from '../no-class-components/index.js';
import type { Diagnostic } from '@equinor/fusion-framework-lint-core';

function lintTsx(source: string): Diagnostic[] {
  return noClassComponents.check(source, 'fixture.tsx');
}

function lintTs(source: string): Diagnostic[] {
  return noClassComponents.check(source, 'fixture.ts');
}

// ── Passing cases ─────────────────────────────────────────────────────────────

describe('no-class-components — passing', () => {
  it('passes: function component', () => {
    expect(lintTsx(`export function UserCard({ user }: Props) { return null; }`)).toHaveLength(0);
  });

  it('passes: arrow function component', () => {
    expect(lintTsx(`export const UserCard = ({ user }: Props) => null;`)).toHaveLength(0);
  });

  it('passes: class that does NOT extend Component', () => {
    expect(lintTsx(`class DataStore extends EventEmitter { }`)).toHaveLength(0);
  });

  it('passes: class component in .ts file — not flagged (TS scope only)', () => {
    // Rule scoped to .tsx/.jsx only
    expect(
      lintTs(`class Foo extends React.Component<Props> { render() { return null; } }`),
    ).toHaveLength(0);
  });
});

// ── Failing cases ─────────────────────────────────────────────────────────────

describe('no-class-components — failing', () => {
  it('fails: class extends React.Component', () => {
    const source = `
export class UserCard extends React.Component<UserCardProps> {
  render() { return null; }
}
`;
    const diags = lintTsx(source);
    expect(diags).toHaveLength(1);
    expect(diags[0].rule).toBe('no-class-components');
    expect(diags[0].message).toContain('UserCard');
    expect(diags[0].message).toContain('function component');
  });

  it('fails: class extends Component (bare import)', () => {
    const source = `
import { Component } from 'react';
export class Counter extends Component<Props, State> {
  render() { return null; }
}
`;
    const diags = lintTsx(source);
    expect(diags).toHaveLength(1);
    expect(diags[0].message).toContain('Counter');
  });

  it('fails: class extends React.PureComponent', () => {
    const source = `
export class PureCard extends React.PureComponent<Props> {
  render() { return null; }
}
`;
    const diags = lintTsx(source);
    expect(diags).toHaveLength(1);
    expect(diags[0].message).toContain('PureCard');
  });

  it('fails: class extends PureComponent (bare import)', () => {
    const source = `
import { PureComponent } from 'react';
export class PureCard extends PureComponent { render() { return null; } }
`;
    expect(lintTsx(source)).toHaveLength(1);
  });

  it('fails: default severity is error', () => {
    const diags = lintTsx(`class Foo extends React.Component { render() { return null; } }`);
    expect(diags[0].severity).toBe('error');
  });
});
