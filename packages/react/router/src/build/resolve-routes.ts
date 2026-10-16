import { stat } from 'node:fs/promises';
import path from 'node:path';

import { collectRegistryRoutes } from './collect-registry-routes.js';
import { compareCodeUnits } from './compare-code-units.js';
import { discoverFileRoutes, type RouteCollection } from './discover-file-routes.js';
import { loadRouteRegistryModule } from './load-route-registry-module.js';
import { sortRoutes } from './sort-routes.js';
import { toProjectPath } from './to-project-path.js';
import type {
  ResolvedRouteGraph,
  ResolveRoutesOptions,
  RouteDiagnostic,
  RouteGraphSource,
} from './types.js';
import { validateRoutes } from './validate-routes.js';

/** Default file-route directory, relative to the project root. */
const DEFAULT_ROUTE_DIRECTORY = 'src/routes';

/** Conventional registry module names inside the route directory. */
const REGISTRY_FILE_NAMES = ['routes.ts', 'routes.tsx'];

/**
 * Returns the kind of file-system entry at a path.
 *
 * @param target - Absolute path.
 * @returns `'file'`, `'directory'` or `null` when nothing usable exists.
 */
async function entryKind(target: string): Promise<'file' | 'directory' | null> {
  try {
    const info = await stat(target);
    // Other entry types (sockets, devices) are treated as absent
    if (info.isFile()) return 'file';
    return info.isDirectory() ? 'directory' : null;
  } catch {
    return null;
  }
}

/**
 * Orders diagnostics by first file, code and message so output is stable.
 *
 * @param a - First diagnostic.
 * @param b - Second diagnostic.
 * @returns Sort order for `Array.prototype.sort`.
 */
function compareDiagnostics(a: RouteDiagnostic, b: RouteDiagnostic): number {
  return (
    compareCodeUnits(a.files[0] ?? '', b.files[0] ?? '') ||
    compareCodeUnits(a.code, b.code) ||
    compareCodeUnits(a.message, b.message)
  );
}

/**
 * Builds the final graph: validates graph-wide rules and sorts every list canonically.
 *
 * @param source - Route source that produced the collection.
 * @param collection - Routes, diagnostics and dependencies from the source.
 * @returns The canonical route graph.
 */
function toGraph(source: RouteGraphSource, collection: RouteCollection): ResolvedRouteGraph {
  // Source diagnostics and graph-wide validation are reported together in stable order
  const diagnostics = [...collection.diagnostics, ...validateRoutes(collection.routes)];
  return {
    source,
    routes: sortRoutes(collection.routes),
    diagnostics: diagnostics.sort(compareDiagnostics),
    dependencies: [...new Set(collection.dependencies)].sort(compareCodeUnits),
  };
}

/**
 * Creates a graph that contains only one configuration diagnostic.
 *
 * @param source - Route source the configuration refers to.
 * @param diagnostic - The configuration problem.
 * @returns A graph without routes.
 */
function toFailedGraph(source: RouteGraphSource, diagnostic: RouteDiagnostic): ResolvedRouteGraph {
  return toGraph(source, { routes: [], diagnostics: [diagnostic], dependencies: [] });
}

/**
 * Resolves an application's routes into the canonical route graph shared by
 * development, production build, preview and manifest generation.
 *
 * Route source precedence:
 *
 * 1. `routesFile`, when given, is an explicit route registry.
 * 2. Otherwise `routes.ts` / `routes.tsx` directly in the route directory is the registry.
 * 3. Otherwise routes are discovered from the route directory (default `src/routes`).
 *
 * A registry replaces discovery; the two are never merged. Discovery follows the
 * file convention: `index.ts(x)` is an index route, `layout.ts(x)` is a pathless
 * layout around its directory, other modules and folders are static segments, and
 * `[name]` modules or folders are required dynamic segments. Declaration files,
 * `*.test` / `*.spec` files, hidden names and `_`-prefixed names (including
 * `__tests__` and `__mocks__`) are ignored.
 *
 * Resolution is build-only: it reads module source to detect capabilities, never
 * mounts React, requires a DOM, starts Vite or runs route components, loaders or
 * actions. Problems are returned as diagnostics naming the source files; call
 * {@link assertRouteGraph} to fail on errors.
 *
 * @param options - Project root and optional route directory or registry file.
 * @returns The canonical route graph with diagnostics and file dependencies.
 * @throws {TypeError} When `options.root` is not an absolute path.
 *
 * @example
 * ```ts
 * import { assertRouteGraph, resolveRoutes } from '@equinor/fusion-framework-react-router/build';
 *
 * const graph = assertRouteGraph(await resolveRoutes({ root: '/repo/apps/my-app' }));
 * for (const route of graph.routes) {
 *   console.log(route.id, route.kind, route.path);
 * }
 * // file:src/routes/layout.tsx layout /
 * // file:src/routes/index.tsx index /
 * // file:src/routes/projects/[projectId]/index.tsx index /projects/:projectId
 * ```
 */
export async function resolveRoutes(options: ResolveRoutesOptions): Promise<ResolvedRouteGraph> {
  const { root } = options;
  // A relative root would make IDs depend on the process working directory
  if (!path.isAbsolute(root)) {
    throw new TypeError(`resolveRoutes() requires an absolute project root, received "${root}".`);
  }

  const directoryOption = options.directory ?? DEFAULT_ROUTE_DIRECTORY;
  const directoryPath = path.resolve(root, directoryOption);
  const directory = toProjectPath(root, directoryPath);
  // Route IDs are project-relative, so the route directory must live inside the root
  if (!directory) {
    return toFailedGraph(
      { kind: 'none', directory: directoryOption },
      {
        severity: 'error',
        code: 'route-file-outside-root',
        message: `Route directory "${directoryOption}" must be a folder inside the project root.`,
        files: [directoryOption],
      },
    );
  }

  // An explicitly configured registry always wins, and must exist
  if (options.routesFile) {
    const registryPath = path.resolve(root, options.routesFile);
    const registry = toProjectPath(root, registryPath);
    // The registry path becomes part of diagnostics and dependencies, so it must be project-relative
    if (!registry) {
      return toFailedGraph(
        { kind: 'registry', file: options.routesFile },
        {
          severity: 'error',
          code: 'route-file-outside-root',
          message: `Route registry "${options.routesFile}" must be inside the project root.`,
          files: [options.routesFile],
        },
      );
    }
    // A configured but missing registry is an error rather than a silent fallback to discovery
    if ((await entryKind(registryPath)) !== 'file') {
      return toFailedGraph(
        { kind: 'registry', file: registry },
        {
          severity: 'error',
          code: 'missing-routes-file',
          message: `Configured route registry ${registry} does not exist.`,
          files: [registry],
        },
      );
    }
    return resolveRegistry(root, registryPath, registry);
  }

  const conventional: string[] = [];
  // Look for conventional registry files in the route directory
  for (const name of REGISTRY_FILE_NAMES) {
    const candidate = path.join(directoryPath, name);
    // Folders named like a registry are not registries
    if ((await entryKind(candidate)) === 'file') conventional.push(candidate);
  }
  // Both `routes.ts` and `routes.tsx` would leave the source of truth ambiguous
  if (conventional.length > 1) {
    // Name both registries in project-relative form
    const files = conventional.map((file) => toProjectPath(root, file) ?? file);
    return toFailedGraph(
      { kind: 'registry', file: files[0] },
      {
        severity: 'error',
        code: 'ambiguous-route-registry',
        message: `Only one route registry is allowed; found ${files.join(', ')}.`,
        files,
      },
    );
  }
  // A conventional registry replaces discovery for the whole directory
  if (conventional[0]) {
    return resolveRegistry(root, conventional[0], toProjectPath(root, conventional[0]) ?? '');
  }

  // An app without a route directory simply has no file routes
  if ((await entryKind(directoryPath)) !== 'directory') {
    return toGraph({ kind: 'none', directory }, { routes: [], diagnostics: [], dependencies: [] });
  }
  return toGraph({ kind: 'discovery', directory }, await discoverFileRoutes(root, directoryPath));
}

/**
 * Evaluates a registry and converts its DSL nodes, turning load failures into diagnostics.
 *
 * @param root - Absolute project root.
 * @param registryPath - Absolute registry path.
 * @param registry - Project-relative registry path.
 * @returns The registry route graph.
 */
async function resolveRegistry(
  root: string,
  registryPath: string,
  registry: string,
): Promise<ResolvedRouteGraph> {
  const source: RouteGraphSource = { kind: 'registry', file: registry };
  let definition: unknown;
  try {
    definition = await loadRouteRegistryModule(root, registryPath);
  } catch (error) {
    const cause = error instanceof Error && error.cause instanceof Error ? error.cause : error;
    return toGraph(source, {
      routes: [],
      diagnostics: [
        {
          severity: 'error',
          code: 'route-registry-load-failed',
          message: `Route registry ${registry} could not be evaluated: ${
            cause instanceof Error ? cause.message : String(cause)
          }`,
          files: [registry],
        },
      ],
      dependencies: [registry],
    });
  }
  return toGraph(source, await collectRegistryRoutes(root, registryPath, definition));
}
