import type { RouteNode } from '../types.js';
import { BaseRoute } from './BaseRoute.js';

/**
 * Represents a prefix route that prepends a path segment to all child routes.
 *
 * Unlike {@link LayoutRoute}, a prefix route does **not** render a component —
 * it only adds a URL segment. Use it to group routes under a common path
 * (e.g. `'products'`) without introducing a wrapping layout.
 */
export class PrefixRoute extends BaseRoute {
  /**
   * @param path - The path segment prepended to all children (e.g. `'products'`).
   * @param children - Child route nodes that will be nested under this prefix.
   */
  constructor(
    public readonly path: string,
    public readonly children: RouteNode[],
  ) {
    super('prefix');
  }
}
