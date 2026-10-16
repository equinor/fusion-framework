/**
 * Build-tool entry point for `@equinor/fusion-framework-react-router`.
 *
 * Resolves an application's file routes or explicit route registry into the
 * canonical route graph used by build tooling (startup generation, Vite
 * integration and manifest generation). Node.js only: never import this entry
 * from application or browser code.
 *
 * @packageDocumentation
 */
export { resolveRoutes } from './resolve-routes.js';
export { assertRouteGraph } from './assert-route-graph.js';
export { RouteResolutionError } from './RouteResolutionError.js';
export { detectRouteModuleCapabilities } from './detect-route-module-capabilities.js';
export type {
  ResolveRoutesOptions,
  ResolvedRoute,
  ResolvedRouteGraph,
  ResolvedRouteKind,
  RouteDiagnostic,
  RouteDiagnosticCode,
  RouteGraphSource,
  RouteModuleCapability,
} from './types.js';
