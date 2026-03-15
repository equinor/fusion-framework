import type { RouteKind, RouteNode, RouterSchema } from '../types.js';

/**
 * Base abstract class for all route nodes in the DSL.
 *
 * Provides the foundation for route definition and conversion to React Router `RouteObject`.
 * Subclasses include {@link BaseFileRoute} (for file-backed routes) and concrete
 * node types like `LayoutRoute`, `IndexRoute`, `Route`, and `PrefixRoute`.
 */
export abstract class BaseRoute implements RouteNode {
  /** Route schema metadata (description, params, search) attached to the node. */
  public readonly schema: RouterSchema = {};

  /**
   * @param kind - The kind of route node (`'route'`, `'index'`, `'layout'`, or `'prefix'`).
   */
  constructor(public readonly kind: RouteKind) {}
}
