import type { NonIndexRouteObject, RouteObject as ReactRouterRouteObject } from 'react-router';
import type { RouteNode, FusionRouterContext } from '../types.js';
import { BaseFileRoute } from './BaseFileRoute.js';

/**
 * Represents a layout route that wraps child routes.
 * Layout routes provide a shared component structure for nested routes.
 */
export class LayoutRoute extends BaseFileRoute {
  constructor(
    file: string,
    public readonly children: RouteNode[],
  ) {
    super('layout', file);
  }

  /**
   * Adds a child route to this layout.
   * @param child - The child route node to add
   */
  addChild(child: RouteNode) {
    this.children.push(child);
  }

  toRouteObject(options?: { loader?: React.ReactElement; context?: FusionRouterContext }): NonIndexRouteObject {
    const childRouteObjects = this.children.flatMap((child) => {
      const result = child.toRouteObject(options);
      return Array.isArray(result) ? result : [result];
    });
    return {
      ...super.toRouteObject(options),
      index: false,
      children: childRouteObjects as ReactRouterRouteObject[],
    };
  }
}

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
export const layout = (file: string, children: RouteNode[]) =>
  new LayoutRoute(file, children);

export default layout;