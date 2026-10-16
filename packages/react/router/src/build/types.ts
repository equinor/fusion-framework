import type { RouteKind, RouterSchema } from '../types.js';

/**
 * Options for {@link resolveRoutes}, the build-time route resolver.
 *
 * Relative `directory` and `routesFile` values are resolved against `root`,
 * never against the process working directory, so the same project resolves
 * to the same route graph on every machine.
 */
export interface ResolveRoutesOptions {
  /** Absolute path to the application project root (the folder containing `package.json`). */
  root: string;
  /** Route directory used for file-route discovery. Defaults to `src/routes`. */
  directory?: string;
  /**
   * Explicit route registry module. When omitted, `routes.ts` or `routes.tsx`
   * directly inside {@link ResolveRoutesOptions.directory} is used if present.
   */
  routesFile?: string;
}

/**
 * Kind of an entry in the resolved route graph.
 *
 * DSL `prefix` nodes only contribute URL segments, so they never appear as graph entries.
 */
export type ResolvedRouteKind = Exclude<RouteKind, 'prefix'>;

/**
 * Capability a route module provides, detected from its exports without executing it.
 *
 * | Capability | Module export |
 * | --- | --- |
 * | `component` | `default` |
 * | `clientLoader` | `clientLoader` |
 * | `action` | `action` |
 * | `handle` | `handle` |
 * | `errorElement` | `ErrorElement` |
 * | `hydrateFallback` | `HydrateFallback` |
 * | `shouldRevalidate` | `shouldRevalidate` |
 * | `middleware` | `middleware` |
 */
export type RouteModuleCapability =
  | 'component'
  | 'clientLoader'
  | 'action'
  | 'handle'
  | 'errorElement'
  | 'hydrateFallback'
  | 'shouldRevalidate'
  | 'middleware';

/**
 * A single route in the canonical route graph returned by {@link resolveRoutes}.
 *
 * Entries are plain JSON-compatible data, so build consumers (startup generation,
 * manifest generation, development tooling) can share one interpretation of the
 * route source without mounting React or loading route modules.
 */
export interface ResolvedRoute {
  /**
   * Stable route ID. Discovered routes use `file:<project-relative module path>`.
   * Explicit DSL routes use the same form, suffixed with `#<kind>:<path>` when one
   * module is reused at several graph locations.
   */
  id: string;
  /** ID of the nearest enclosing layout or route entry, or `null` for a root entry. */
  parentId: string | null;
  /** Route kind: `layout` (pathless wrapper), `index` or `route`. */
  kind: ResolvedRouteKind;
  /**
   * Full app-relative path pattern starting with `/`, using React Router syntax
   * (for example `/projects/:projectId`). Layout entries carry the path of the
   * section they wrap.
   */
  path: string;
  /** Normalized project-relative module path using `/` separators (for example `src/routes/index.tsx`). */
  module: string;
  /** Capabilities detected from the module exports, in the canonical order of {@link RouteModuleCapability}. */
  capabilities: RouteModuleCapability[];
  /**
   * Authored route metadata. Explicit DSL routes carry their `RouterSchema`;
   * discovered routes start empty because module metadata is never obtained by
   * executing route modules.
   */
  metadata: RouterSchema;
}

/**
 * Identifies which route source produced a resolved route graph.
 *
 * - `discovery`: routes were discovered from the route directory.
 * - `registry`: an explicit route registry replaced discovery entirely.
 * - `none`: neither a registry nor the route directory exists.
 */
export type RouteGraphSource =
  | { kind: 'discovery'; directory: string }
  | { kind: 'registry'; file: string }
  | { kind: 'none'; directory: string };

/** Machine-readable code identifying a route resolution problem. */
export type RouteDiagnosticCode =
  | 'ambiguous-route-registry'
  | 'case-collision'
  | 'duplicate-index'
  | 'duplicate-layout'
  | 'duplicate-route-path'
  | 'invalid-dynamic-segment'
  | 'invalid-route-registry'
  | 'missing-route-capability'
  | 'missing-routes-file'
  | 'route-file-outside-root'
  | 'route-file-unreadable'
  | 'route-registry-load-failed'
  | 'unresolved-route-file'
  | 'unsupported-registry-import'
  | 'unsupported-route-segment';

/**
 * A problem found while resolving routes. Every diagnostic names the
 * project-relative source files involved so authors can locate the conflict.
 */
export interface RouteDiagnostic {
  /** `error` diagnostics make the graph unusable; see {@link assertRouteGraph}. */
  severity: 'error' | 'warning';
  /** Machine-readable diagnostic code. */
  code: RouteDiagnosticCode;
  /** Human-readable explanation including the conflicting source paths. */
  message: string;
  /** Sorted project-relative source paths involved in the problem. */
  files: string[];
}

/**
 * Canonical route graph produced by {@link resolveRoutes}.
 *
 * Routes are ordered parent-before-child with siblings sorted by path, kind and ID,
 * so the same sources always yield identical graphs.
 */
export interface ResolvedRouteGraph {
  /** Which route source produced the graph. */
  source: RouteGraphSource;
  /** Resolved routes in canonical order. */
  routes: ResolvedRoute[];
  /** Resolution problems; any `error` diagnostic means the graph must not be used. */
  diagnostics: RouteDiagnostic[];
  /**
   * Sorted project-relative files whose content was read to produce the graph.
   * Development tooling re-resolves when one of these changes, or when a file is
   * added, removed or moved under the route directory.
   */
  dependencies: string[];
}
