import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

import type { Loader, Plugin } from 'esbuild';

import { isInsideDirectory } from './is-inside-directory.js';
import { ROUTE_DSL_NAMESPACE } from './route-dsl-namespace.js';
import { ROUTE_DSL_SPECIFIER_PATTERN } from './route-dsl-specifier-pattern.js';

/** Candidate bare specifiers (packages, built-ins and aliases); esbuild filters use Go regex syntax. */
const BARE_SPECIFIER_FILTER = /^[^./]/;

/** Windows drive paths and URLs, which start like bare specifiers but are not. */
const NOT_BARE_PATTERN = /^(?:[A-Za-z]:[\\/]|[a-z][a-z\d+.-]*:\/\/)/;

/** Marks a nested resolve so the bare-specifier hook does not handle its own lookup. */
const NESTED_RESOLVE = Symbol('fusion-route-dsl-nested-resolve');

/** `import.meta.url`, `import.meta.dirname` and `import.meta.filename`, which describe their own module. */
const IMPORT_META_LOCATION_PATTERN = /\bimport\.meta\.(url|dirname|filename)\b/g;

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
 * - Bare imports are resolved by esbuild. Node built-ins stay external, installed
 *   packages become external `file:` URLs (the bundle runs from a `data:` URL), and
 *   aliases that resolve to project source are bundled so they are checked like
 *   relative imports.
 * - `import.meta.url`, `dirname` and `filename` in project modules are replaced with
 *   the values of the original module.
 *
 * @param dslEntry - Absolute path of the route DSL entry module (with or without extension).
 * @param projectRoots - Project root, plus its real path when it differs, used to tell
 *   project source from packages.
 * @returns The esbuild plugin.
 */
export function createRouteDslPlugin(dslEntry: string, projectRoots: readonly string[]): Plugin {
  /**
   * Whether a resolved file is project source (for example reached through a
   * tsconfig path alias) rather than installed package code.
   *
   * @param file - Absolute resolved path.
   * @returns `true` for files inside the project and outside `node_modules`.
   */
  const isProjectSource = (file: string): boolean => {
    // Installed package code is never bundled as project source
    if (file.split(/[\\/]/).includes('node_modules')) return false;
    // Any accepted root spelling (lexical or symlink-resolved) makes it project source
    return projectRoots.some((root) => isInsideDirectory(root, file));
  };

  return {
    name: 'fusion-route-dsl',
    setup(build) {
      // Each declaring directory gets its own shim so references keep their call-site base
      build.onResolve({ filter: ROUTE_DSL_SPECIFIER_PATTERN }, (args) => ({
        path: args.resolveDir,
        namespace: ROUTE_DSL_NAMESPACE,
      }));

      // The bundle runs from a data: URL, which cannot resolve bare specifiers itself
      build.onResolve({ filter: BARE_SPECIFIER_FILTER }, async (args) => {
        // The nested lookup below must reach esbuild's own resolver
        if (
          args.pluginData === NESTED_RESOLVE ||
          args.namespace !== 'file' ||
          NOT_BARE_PATTERN.test(args.path)
        ) {
          return undefined;
        }
        const result = await build.resolve(args.path, {
          kind: args.kind,
          importer: args.importer,
          resolveDir: args.resolveDir,
          pluginData: NESTED_RESOLVE,
        });
        // Unresolvable imports surface as located build errors
        if (result.errors.length > 0) return { errors: result.errors };
        // Node built-ins stay as written; Node resolves them from any module
        if (result.external) return { path: result.path, external: true };
        // Aliased project files are bundled, so the pre-evaluation check covers them
        if (isProjectSource(result.path)) return { path: result.path };
        // Installed packages run from their real location, as when the app imports them
        return { path: pathToFileURL(result.path).href, external: true };
      });

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
        // Most modules do not inspect their own location, so esbuild can load them unchanged
        if (!contents.includes('import.meta.')) return undefined;
        const base = path.dirname(args.path);
        const location: Readonly<Record<string, string>> = {
          url: pathToFileURL(args.path).href,
          dirname: base,
          filename: args.path,
        };
        return {
          contents: contents
            .replace(
              IMPORT_META_RESOLVE_PATTERN,
              (_match, quote: string, specifier: string) =>
                `${quote}${pathToFileURL(path.resolve(base, specifier)).href}${quote}`,
            )
            // Bundled modules would otherwise all report the data: URL of the bundle
            .replace(IMPORT_META_LOCATION_PATTERN, (_match, key: string) =>
              JSON.stringify(location[key]),
            ),
          loader,
        };
      });
    },
  };
}
