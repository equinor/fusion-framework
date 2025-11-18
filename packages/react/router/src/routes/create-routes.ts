import type { RouteNode, FusionRouterContext, RouteObject } from '../types.js';

type CreateRoutesOptions = {
  loader?: React.ReactElement;
  context?: FusionRouterContext;
};

/**
 * Converts an array of route nodes to React Router's RouteObject format.
 * @param routes - Array of route nodes to convert
 * @param options - Options for route creation including loader and context
 * @returns Array of RouteObjects for React Router
 */
export const createRoutes = (
  routes: RouteNode | RouteNode[],
  options?: CreateRoutesOptions,
): RouteObject[] => {
  const { loader, context } = options ?? {};
  const routeNodes = Array.isArray(routes) ? routes : [routes];
  return routeNodes.flatMap((route) => {
    const result = route.toRouteObject({ loader, context });
    return Array.isArray(result) ? result : [result];
  }) as RouteObject[];
};
