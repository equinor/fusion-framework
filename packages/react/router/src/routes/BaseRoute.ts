import type { RouteKind, RouteNode, RouterSchema } from '../types.js';

/**
 * Base abstract class for all route nodes.
 * Provides the foundation for route definition and conversion to React Router's RouteObject.
 */
export abstract class BaseRoute implements RouteNode {
  public readonly schema: RouterSchema = {};
  constructor(public readonly kind: RouteKind) {}
}
