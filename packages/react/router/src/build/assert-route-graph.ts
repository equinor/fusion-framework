import { RouteResolutionError } from './RouteResolutionError.js';
import type { ResolvedRouteGraph } from './types.js';

/**
 * Asserts that a resolved route graph has no error diagnostics, so build steps
 * (startup generation, bundling, manifest generation) fail with source paths
 * instead of continuing with an ambiguous or incomplete route tree.
 *
 * Warnings are left for the caller to report.
 *
 * @param graph - Graph returned by {@link resolveRoutes}.
 * @returns The same graph, for chaining.
 * @throws {RouteResolutionError} When the graph contains at least one error diagnostic.
 *
 * @example
 * ```ts
 * import { assertRouteGraph, resolveRoutes } from '@equinor/fusion-framework-react-router/build';
 *
 * const graph = assertRouteGraph(await resolveRoutes({ root: projectRoot }));
 * ```
 */
export function assertRouteGraph(graph: ResolvedRouteGraph): ResolvedRouteGraph {
  // Only errors block the build; warnings stay in the graph for the caller to report
  const errors = graph.diagnostics.filter((diagnostic) => diagnostic.severity === 'error');
  // Fail fast so no downstream step consumes an unusable graph
  if (errors.length > 0) {
    throw new RouteResolutionError(errors);
  }
  return graph;
}
