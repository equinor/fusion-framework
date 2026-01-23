import type { RouteNode } from '../types.js';
import { BaseRoute } from './BaseRoute.js';

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
