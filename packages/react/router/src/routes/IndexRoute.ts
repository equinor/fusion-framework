import type { RouterSchema } from '../types.js';
import { BaseFileRoute } from './BaseFileRoute.js';

/**
 * Represents an index route that renders at the parent route’s path.
 *
 * Index routes provide default content when the parent route matches
 * but no child route does (equivalent to `index: true` in React Router).
 */
export class IndexRoute extends BaseFileRoute {
  /**
   * @param file - Path to the index route component module.
   * @param schema - Optional route schema for documentation and manifest generation.
   */
  constructor(file: string, schema?: RouterSchema) {
    super('index', file, schema ? { route: schema } : { route: {} });
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
 *   index('./pages/home.tsx', {
 *     description: 'Home page'
 *   })
 * ];
 * ```
 */
export const index = (file: string, schema?: RouterSchema) => new IndexRoute(file, schema);

export default index;
