// @vitest-environment node
import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

import * as buildEntry from '../build/index.js';
import { detectRouteModuleCapabilities } from '../build/detect-route-module-capabilities.js';

describe('detectRouteModuleCapabilities', () => {
  it('detects inline declarations of every recognized export', () => {
    const source = [
      'export default function Page() {}',
      'export async function clientLoader() {}',
      'export const action = async () => null;',
      'export const handle = { route: {} };',
      'export function ErrorElement() {}',
      'export class HydrateFallback {}',
      'export let shouldRevalidate = () => true;',
      'export const middleware = [];',
    ].join('\n');

    expect(detectRouteModuleCapabilities(source)).toEqual([
      'component',
      'clientLoader',
      'action',
      'handle',
      'errorElement',
      'hydrateFallback',
      'shouldRevalidate',
      'middleware',
    ]);
  });

  it('detects export lists, aliases and re-exports', () => {
    const source = [
      'const Page = () => null;',
      'const load = () => null;',
      'export { Page as default, load as clientLoader };',
      "export { action } from './shared';",
    ].join('\n');

    expect(detectRouteModuleCapabilities(source)).toEqual(['component', 'clientLoader', 'action']);
  });

  it('ignores comments, strings and type-only exports', () => {
    const source = [
      '// export default function Commented() {}',
      '/* export const clientLoader = 1; */',
      "const text = 'export const action = 1';",
      'const template = `export const handle = 1`;',
      'export type { clientLoader } from "./types";',
      'export { type action };',
      'export const helper = 1;',
    ].join('\n');

    expect(detectRouteModuleCapabilities(source)).toEqual([]);
  });

  it('ignores export-like text in nested template expressions and escaped quotes', () => {
    const source = [
      "const a = 'it\\'s export const action = 1';",
      // biome-ignore lint/suspicious/noTemplateCurlyInString: the string is module source under test
      'const b = `${`export const clientLoader = ${1}`} export const handle = 1`;',
      'const c = "/* not a comment */"; export const middleware = [];',
    ].join('\n');

    expect(detectRouteModuleCapabilities(source)).toEqual(['middleware']);
  });

  it('detects named and namespace re-exports, leaving star re-exports to the resolver', () => {
    const source = [
      "export { default, clientLoader as clientLoader } from './page';",
      "export { load as action, type Handle } from './load';",
      "export * from './everything';",
      "export * as handle from './handle';",
    ].join('\n');

    expect(detectRouteModuleCapabilities(source)).toEqual([
      'component',
      'clientLoader',
      'action',
      'handle',
    ]);
  });

  it('ignores export-like text in regular expression literals', () => {
    const source = [
      'const pattern = /export default/;',
      'const other = /export const middleware = 1/g;',
      'const klass = /[/]export default function X() {}/u;',
      'if (pattern.test(value)) call(/export const action = 1/);',
      'export const helper = 1;',
    ].join('\n');

    expect(detectRouteModuleCapabilities(source)).toEqual([]);
  });

  it('keeps division distinct from regular expression literals', () => {
    const source = [
      'const half = total / 2; const ratio = (a + b) / c / d;',
      'export const action = async () => items[0] / 2;',
      'export default function Page() { return null; }',
    ].join('\n');

    expect(detectRouteModuleCapabilities(source)).toEqual(['component', 'action']);
  });

  it('limits an apostrophe in JSX text to its own line', () => {
    const source = [
      'export default function Page() {',
      "  return <p>Don't have access</p>;",
      '}',
      'export const clientLoader = () => null;',
    ].join('\n');

    expect(detectRouteModuleCapabilities(source)).toEqual(['component', 'clientLoader']);
  });

  it('ignores type-only and ambient declarations', () => {
    const source = [
      'export type clientLoader = () => null;',
      'export interface action {}',
      'export declare const handle: unknown;',
      'export declare function ErrorElement(): null;',
      'export type { middleware };',
    ].join('\n');

    expect(detectRouteModuleCapabilities(source)).toEqual([]);
  });

  it('detects every declarator of multi-declarator and destructuring exports', () => {
    const source = [
      'export const helper = 1, clientLoader = () => ({ a: [1, 2] }), action = call(1, 2);',
      'export const { handle, nested: { deep: ErrorElement }, renamed: shouldRevalidate } = config;',
      'export const [HydrateFallback, ...rest] = pair;',
      'export let middleware: Array<Record<string, () => void>> = [], other = 2;',
    ].join('\n');

    expect(detectRouteModuleCapabilities(source)).toEqual([
      'clientLoader',
      'action',
      'handle',
      'errorElement',
      'hydrateFallback',
      'shouldRevalidate',
      'middleware',
    ]);
  });

  it('does not report object keys or default values as exports', () => {
    const source = [
      'export const { clientLoader: load = action, ...handle } = config;',
      'export const settings = { action: 1, clientLoader: () => null };',
    ].join('\n');

    expect(detectRouteModuleCapabilities(source)).toEqual(['handle']);
  });
});

describe('build entry point', () => {
  it('is published as the ./build subpath with types', () => {
    const manifest = JSON.parse(
      readFileSync(new URL('../../package.json', import.meta.url), 'utf8'),
    ) as { exports: Record<string, { import: string; types: string }> };

    expect(manifest.exports['./build']).toEqual({
      import: './dist/esm/build/index.js',
      types: './dist/types/build/index.d.ts',
    });
  });

  it('exports the resolver API', () => {
    expect(Object.keys(buildEntry).sort()).toEqual([
      'RouteResolutionError',
      'assertRouteGraph',
      'detectRouteModuleCapabilities',
      'resolveRoutes',
    ]);
  });
});
