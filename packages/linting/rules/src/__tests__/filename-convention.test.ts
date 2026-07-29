import { describe, it, expect } from 'vitest';
import { filenameConvention } from '../filename-convention/index.js';
import type { Diagnostic, Rule } from '@equinor/fusion-framework-lint-core';

function lint(source: string, file: string, rule: Rule = filenameConvention()): Diagnostic[] {
  // mirror the engine: skip `check` entirely when `match` opts the file out
  if (rule.match && !rule.match(file)) return [];
  return rule.check(source, { filePath: file });
}

// ── Passing cases ─────────────────────────────────────────────────────────────

describe('filename-convention — passing', () => {
  it('passes: class filename matches export exactly', () => {
    const source = `export class HttpResponseError extends Error {}`;
    expect(lint(source, '/src/HttpResponseError.ts')).toHaveLength(0);
  });

  it('passes: component (arrow function, PascalCase) filename matches export exactly', () => {
    const source = `export const UserCard = (props) => <div>{props.user.name}</div>;`;
    expect(lint(source, '/src/UserCard.tsx')).toHaveLength(0);
  });

  it('passes: component (function declaration, PascalCase) filename matches export exactly', () => {
    const source = `export function UserCard(props) { return <div>{props.user.name}</div>; }`;
    expect(lint(source, '/src/UserCard.tsx')).toHaveLength(0);
  });

  it('passes: hook filename matches export exactly', () => {
    const source = `export const useFeatureFlag = (key) => { return true; };`;
    expect(lint(source, '/src/useFeatureFlag.ts')).toHaveLength(0);
  });

  it('passes: plain function export with kebab-case filename', () => {
    const source = `export function capitalizeRequestMethod(method) { return method.toUpperCase(); }`;
    expect(lint(source, '/src/capitalize-request-method.ts')).toHaveLength(0);
  });

  it('passes: plain const export with kebab-case filename', () => {
    const source = `export const defaultTimeout = 5000;`;
    expect(lint(source, '/src/default-timeout.ts')).toHaveLength(0);
  });

  it('passes: kebab-case filename with a dotted category suffix (e.g. `.schema.ts`)', () => {
    const source = `export const myFoo = z.object({});`;
    expect(lint(source, '/src/my-foo.schema.ts')).toHaveLength(0);
  });

  it('passes: kebab-case filename with a dotted `.operator.ts` category suffix', () => {
    const source = `export function sse(options) { return options; }`;
    expect(lint(source, '/src/sse.operator.ts')).toHaveLength(0);
  });

  it('passes: index.ts barrel is exempt regardless of export count', () => {
    const source = `
export function foo() {}
export function bar() {}
`;
    expect(lint(source, '/src/index.ts')).toHaveLength(0);
  });

  it('passes: files with multiple top-level value exports are skipped (single-export-per-file territory)', () => {
    const source = `
export const foo = () => {};
export const bar = () => {};
`;
    expect(lint(source, '/src/whatever.ts')).toHaveLength(0);
  });

  it('passes: files with zero value exports (type-only) are skipped', () => {
    const source = `export type Config = { timeout: number };`;
    expect(lint(source, '/src/whatever.ts')).toHaveLength(0);
  });

  it('passes: enum export with matching kebab-case filename', () => {
    const source = `export enum HttpMethod { Get, Post }`;
    expect(lint(source, '/src/http-method.ts')).toHaveLength(0);
  });

  it('passes: a custom exclude pattern opts a file out entirely', () => {
    const rule = filenameConvention({ match: { exclude: ['legacy.ts'] } });
    const source = `export class Foo {}`;
    expect(lint(source, '/src/legacy.ts', rule)).toHaveLength(0);
  });

  it('passes: parent directory acts as an implicit namespace prefix', () => {
    const source = `export const requireIntentCommentFlow = () => {};`;
    expect(lint(source, '/src/require-intent-comment/flow.ts')).toHaveLength(0);
  });
});

// ── Failing cases ─────────────────────────────────────────────────────────────

describe('filename-convention — failing', () => {
  it('fails: class exported but filename is kebab-case', () => {
    const source = `export class HttpResponseError extends Error {}`;
    const diagnostics = lint(source, '/src/http-response-error.ts');
    expect(diagnostics).toHaveLength(1);
    expect(diagnostics[0].rule).toBe('filename-convention');
    expect(diagnostics[0].message).toContain("rename the file to 'HttpResponseError.ts'");
  });

  it('fails: PascalCase component filename does not match export name', () => {
    const source = `export const UserCard = (props) => <div />;`;
    const diagnostics = lint(source, '/src/UserProfile.tsx');
    expect(diagnostics).toHaveLength(1);
    expect(diagnostics[0].message).toContain("rename the file to 'UserCard.tsx'");
  });

  it('fails: hook filename does not match export name', () => {
    const source = `export const useFeatureFlag = (key) => true;`;
    const diagnostics = lint(source, '/src/use-feature-flag.ts');
    expect(diagnostics).toHaveLength(1);
    expect(diagnostics[0].message).toContain("rename the file to 'useFeatureFlag.ts'");
  });

  it('fails: plain function export with PascalCase filename', () => {
    const source = `export function capitalizeRequestMethod(method) { return method; }`;
    const diagnostics = lint(source, '/src/CapitalizeRequestMethod.ts');
    expect(diagnostics).toHaveLength(1);
    expect(diagnostics[0].message).toContain("rename the file to 'capitalize-request-method.ts'");
  });

  it('fails: dotted category suffix present but the base segment does not match the export', () => {
    const source = `export const myFoo = z.object({});`;
    const diagnostics = lint(source, '/src/other-name.schema.ts');
    expect(diagnostics).toHaveLength(1);
    expect(diagnostics[0].message).toContain("rename the file to 'my-foo.ts'");
  });

  it('fails: enum export with mismatched filename', () => {
    const source = `export enum HttpMethod { Get, Post }`;
    const diagnostics = lint(source, '/src/methods.ts');
    expect(diagnostics).toHaveLength(1);
    expect(diagnostics[0].message).toContain("rename the file to 'http-method.ts'");
  });

  it('fails: parent directory namespace prefix does not paper over an unrelated filename', () => {
    const source = `export const requireIntentCommentFlow = () => {};`;
    const diagnostics = lint(source, '/src/require-intent-comment/unrelated.ts');
    expect(diagnostics).toHaveLength(1);
    expect(diagnostics[0].message).toContain("rename the file to 'require-intent-comment-flow.ts'");
  });
});
