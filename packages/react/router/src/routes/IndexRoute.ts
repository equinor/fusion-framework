import type { IndexRouteObject } from 'react-router';
import type { RouterSchema } from '../types.js';
import type { LazyLoaderOptions } from './create-lazy-loader.js';
import { BaseFileRoute } from './BaseFileRoute.js';

/**
 * Represents an index route that renders at the parent route's path.
 * Index routes are used to provide default content for a route segment.
 */
export class IndexRoute extends BaseFileRoute {
  constructor(file: string, schema?: RouterSchema) {
    super('index', file, schema ? { route: schema } : { route: {} });
  }

  toRouteObject(options?: LazyLoaderOptions): IndexRouteObject {
    return {
      ...super.toRouteObject(options),
      index: true,
      children: undefined,
    };
  }
}

/**
 * Creates an index route that renders at the parent route's path.
 * Index routes provide default content when a parent route is matched but no child route is.
 * 
 * @param file - Path to the route component file
 * @param schema - Optional route schema for documentation and type information
 * @returns A new IndexRoute instance
 * 
 * @example
 * ```typescript
 * // pages/home.tsx
 * export default function Home() {
 *   return <h1>Welcome</h1>;
 * }
 * 
 * // routes.ts
 * import { index } from '@equinor/fusion-framework-react-router';
 * 
 * export const routes = [
 *   index('./pages/home.tsx')
 *     .description('Home page')
 * ];
 * ```
 */
export const index = (file: string, schema?: RouterSchema) =>
  new IndexRoute(file, schema);

export default index;
