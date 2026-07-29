import type { RouteNode } from '../types.js';
import { LayoutRoute } from './LayoutRoute.js';

/**
 * Creates a layout route that wraps child routes with a shared component structure.
 * Layout routes render their component with an `<Outlet />` where child routes are rendered.
 *
 * @param file - Path to the layout component file
 * @param children - Array of child route nodes to render within the layout
 * @returns A new LayoutRoute instance
 *
 * @example
 * ```typescript
 * // pages/main.layout.tsx
 * export default function MainLayout() {
 *   return (
 *     <div>
 *       <header>My App</header>
 *       <main>
 *         <Outlet />
 *       </main>
 *     </div>
 *   );
 * }
 *
 * // routes.ts
 * import { layout, index, route } from '@equinor/fusion-framework-react-router';
 *
 * export const routes = [
 *   layout('./pages/main.layout.tsx', [
 *     index('./pages/home.tsx'),
 *     route('about', './pages/about.tsx')
 *   ])
 * ];
 * ```
 */
export const layout = (file: string, children: RouteNode[]) => new LayoutRoute(file, children);

export default layout;
