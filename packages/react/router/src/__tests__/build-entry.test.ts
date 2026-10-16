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
