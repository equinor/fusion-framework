import type { RouterSchema } from '../types.js';
import { IndexRoute } from './IndexRoute.js';

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

export { LayoutRoute } from './LayoutRoute.js';
export { layout } from './layout.js';
export { PrefixRoute } from './PrefixRoute.js';
export { prefix } from './prefix.js';
export { Route } from './Route.js';
export { route } from './route-factory.js';
export type { RouteSchemaEntry } from './to-route-schema.js';
