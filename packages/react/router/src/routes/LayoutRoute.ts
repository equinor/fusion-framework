import type { RouteNode } from '../types.js';
import { BaseFileRoute } from './BaseFileRoute.js';

/**
 * Represents a layout route that wraps child routes.
 *
 * Layout routes render a shared component (typically containing an `<Outlet />`)
 * around all nested child routes. They do **not** add a path segment.
 */
export class LayoutRoute extends BaseFileRoute {
  /**
   * @param file - Path to the layout component module.
   * @param children - Child route nodes rendered inside the layout’s `<Outlet />`.
   */
  constructor(
    file: string,
    public readonly children: RouteNode[],
  ) {
    super('layout', file);
  }
}
