import type { RouteKind, RouteNode, RouterSchema, RouteObject } from '../types.js';
import type { LazyLoaderOptions } from './create-lazy-loader.js';

/**
 * Base abstract class for all route nodes.
 * Provides the foundation for route definition and conversion to React Router's RouteObject.
 */
export abstract class BaseRoute implements RouteNode {
  public readonly schema: RouterSchema = {};
  constructor(public readonly kind: RouteKind) {}
  abstract toRouteObject(options?: LazyLoaderOptions): RouteObject | RouteObject[];
}
