import type { RouterSchema, RouteNode } from '../types.js';
import { BaseFileRoute } from './BaseFileRoute.js';

/**
 * Represents a standard route with a URL path and optional children.
 *
 * Routes define the URL structure and map path patterns (including dynamic
 * segments like `:id`) to page component modules.
 */
export class Route extends BaseFileRoute {
  /**
   * @param file - Path to the route component module.
   * @param path - URL path pattern (supports React Router dynamic segments such as `:id` or `*`).
   * @param children - Optional child route nodes.
   * @param schema - Optional route schema for documentation and manifest generation.
   */
  constructor(
    file: string,
    public readonly path: string,
    public readonly children: RouteNode[] = [],
    schema?: RouterSchema,
  ) {
    super('route', file, schema ? { route: schema } : { route: {} });
  }
}
