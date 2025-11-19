import type { RouteNode, FusionRouterContext, RouteObject } from '../types.js';
import { BaseRoute } from './BaseRoute.js';

/**
 * Joins two path segments, handling leading/trailing slashes properly.
 * @param prefix - The prefix path
 * @param path - The path to append
 * @returns The joined path
 */
function joinPaths(prefix: string, path: string | undefined): string {
  if (!path) return prefix;
  return `${prefix.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
}

/**
 * Represents a prefix route that appends its path to all child routes.
 * Prefix routes are useful for grouping routes under a common path segment.
 */
export class PrefixRoute extends BaseRoute {
  constructor(
    public readonly path: string,
    public readonly children: RouteNode[],
  ) {
    super('prefix');
  }

  /**
   * Adds a child route to this prefix.
   * @param child - The child route node to add
   */
  addChild(child: RouteNode) {
    this.children.push(child);
  }

  toRouteObject(options?: {
    loader?: React.ReactElement;
    context?: FusionRouterContext;
  }): RouteObject[] {
    // Convert children to route objects and prefix their paths
    const prefixedChildren = this.children.map((child) => {
      const childRouteObj = child.toRouteObject(options);
      const childRouteObjects = Array.isArray(childRouteObj) ? childRouteObj : [childRouteObj];
      return childRouteObjects.map((childRoute) => {
        childRoute.path = joinPaths(this.path, childRoute.path);
        return childRoute;
      });
    });

    return prefixedChildren.flat();
  }
}

/**
 * Creates a prefix route that appends its path to all child routes.
 * Prefix routes are useful for grouping routes under a common path segment without creating a layout component.
 *
 * @param path - The path prefix to apply to all children (e.g., 'products' will make child routes start with '/products')
 * @param children - Array of child route nodes that will have the prefix prepended to their paths
 * @returns A new PrefixRoute instance
 *
 * @example
 * ```typescript
 * // routes.ts
 * import { prefix, index, route } from '@equinor/fusion-framework-react-router';
 *
 * export const routes = [
 *   prefix('products', [
 *     index('./pages/products.tsx'),  // Becomes '/products'
 *     route(':id', './pages/product.tsx')  // Becomes '/products/:id'
 *   ])
 * ];
 * ```
 */
export const prefix = (path: string, children: RouteNode[]) => new PrefixRoute(path, children);

export default prefix;
