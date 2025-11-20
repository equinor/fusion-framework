import type { RouterSchema, RouteNode } from '../types.js';
import { BaseFileRoute } from './BaseFileRoute.js';

/**
 * Represents a standard route with a path and optional children.
 * Routes define the URL structure and map paths to components.
 */
export class Route extends BaseFileRoute {
  constructor(
    file: string,
    public readonly path: string,
    public readonly children: RouteNode[] = [],
    schema?: RouterSchema,
  ) {
    super('route', file, schema ? { route: schema } : { route: {} });
  }
}

/**
 * Creates a route with a specific path and optional child routes.
 * Routes define the URL structure and map paths to components.
 *
 * @param path - The URL path pattern (supports dynamic segments like `:id`)
 * @param file - Path to the route component file
 * @param children - Optional array of child route nodes
 * @param schema - Optional route schema for documentation and type information
 * @returns A new Route instance
 *
 * @example
 * ```typescript
 * // pages/product.tsx
 * export default function Product({ params }) {
 *   return <div>Product {params.id}</div>;
 * }
 *
 * // routes.ts
 * import { route } from '@equinor/fusion-framework-react-router';
 *
 * export const routes = [
 *   route(':id', './pages/product.tsx')
 *     .description('Product details page')
 *     .params({ id: 'Product identifier' })
 * ];
 * ```
 */
export const route = (path: string, file: string, children?: RouteNode[], schema?: RouterSchema) =>
  new Route(file, path, children, schema);

export default route;
