import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

import type { Loader, Plugin } from 'esbuild';

import { ROUTE_DSL_NAMESPACE } from './route-dsl-namespace.js';
import { ROUTE_DSL_SPECIFIER_PATTERN } from './route-dsl-specifier-pattern.js';

/** Relative `import.meta.resolve('./x')` calls, which must resolve against their own module. */
const IMPORT_META_RESOLVE_PATTERN = /import\.meta\.resolve\(\s*(['"])(\.{1,2}\/[^'"]+)\1\s*\)/g;

/** Source loaders for module extensions the registry graph may contain. */
const LOADERS: Readonly<Record<string, Loader>> = {
  '.ts': 'ts',
  '.mts': 'ts',
  '.cts': 'ts',
  '.tsx': 'tsx',
  '.js': 'js',
  '.mjs': 'js',
  '.cjs': 'js',
  '.jsx': 'jsx',
};

/**
 * Creates the source of a DSL shim bound to one declaring directory.
 *
 * The shim forwards to the real DSL helpers but rewrites relative module references
 * (`./Page.tsx`, `../pages/list`) into `file:` URLs resolved against the directory of
 * the module that imported the DSL, which is where the Vite plugin resolves them too.
 *
 * @param directory - Absolute directory of the declaring module.
 * @param dslEntry - Absolute path of the route DSL entry module.
 * @returns ES module source for the shim.
 */
function createShimSource(directory: string, dslEntry: string): string {
  const base = pathToFileURL(`${directory}${path.sep}`).href;
  return [
    `import { index as dslIndex, layout as dslLayout, prefix, route as dslRoute } from ${JSON.stringify(dslEntry)};`,
    `export { IndexRoute, LayoutRoute, PrefixRoute, Route } from ${JSON.stringify(dslEntry)};`,
    `const base = ${JSON.stringify(base)};`,
    "const toReference = (file) => typeof file === 'string' && (file.startsWith('./') || file.startsWith('../')) ? new URL(file, base).href : file;",
    'export const index = (file, schema) => dslIndex(toReference(file), schema);',
    'export const layout = (file, children) => dslLayout(toReference(file), children);',
    'export const route = (path, file, children, schema) => dslRoute(path, toReference(file), children, schema);',
    'export { prefix };',
  ].join('\n');
}

/**
 * Creates the esbuild plugin used to bundle route registries for evaluation.
 *
 * - Imports of `@equinor/fusion-framework-react-router` or its `/routes` entry resolve
 *   to a shim per declaring directory, so relative module references resolve at the
 *   DSL call site rather than at the entry registry. The real DSL is bundled, so the
 *   registry does not need the package installed next to it.
 * - Relative `import.meta.resolve()` calls in project modules are replaced with
 *   `file:` URLs resolved against their own module, since the bundle is evaluated
 *   from a `data:` URL.
 *
 * @param dslEntry - Absolute path of the route DSL entry module (with or without extension).
 * @returns The esbuild plugin.
 */
export function createRouteDslPlugin(dslEntry: string): Plugin {
  return {
    name: 'fusion-route-dsl',
    setup(build) {
      // Each declaring directory gets its own shim so references keep their call-site base
      build.onResolve({ filter: ROUTE_DSL_SPECIFIER_PATTERN }, (args) => ({
        path: args.resolveDir,
        namespace: ROUTE_DSL_NAMESPACE,
      }));

      build.onLoad({ filter: /.*/, namespace: ROUTE_DSL_NAMESPACE }, (args) => ({
        contents: createShimSource(args.path, dslEntry),
        loader: 'js',
        resolveDir: path.dirname(dslEntry),
      }));

      build.onLoad({ filter: /\.[cm]?[jt]sx?$/, namespace: 'file' }, async (args) => {
        const loader = LOADERS[path.extname(args.path)];
        // Package code is external and never loaded here; unknown extensions use esbuild defaults
        if (!loader || args.path.split(path.sep).includes('node_modules')) return undefined;
        const contents = await readFile(args.path, 'utf8');
        // Most modules do not resolve paths themselves, so esbuild can load them unchanged
        if (!contents.includes('import.meta.resolve')) return undefined;
        const base = path.dirname(args.path);
        return {
          contents: contents.replace(
            IMPORT_META_RESOLVE_PATTERN,
            (_match, quote: string, specifier: string) =>
              `${quote}${pathToFileURL(path.resolve(base, specifier)).href}${quote}`,
          ),
          loader,
        };
      });
    },
  };
}
