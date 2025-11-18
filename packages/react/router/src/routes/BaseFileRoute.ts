import type {
  ParamsSchema,
  RouteFileNode,
  RouteKind,
  RouteObject,
  RouterHandle,
  SearchSchema,
} from '../types.js';
import { BaseRoute } from './BaseRoute.js';
import { createLazyLoader, type LazyLoaderOptions } from './create-lazy-loader.js';

/**
 * Base abstract class for file-based routes.
 * Handles lazy loading of route components from file paths.
 */
export abstract class BaseFileRoute extends BaseRoute implements RouteFileNode {
  static isFileRoute(node: unknown): node is BaseFileRoute {
    if (node instanceof BaseFileRoute) {
      return true;
    }
    const alias = node as RouteFileNode;
    return 'file' in alias && typeof alias.file === 'string' && alias.file.length > 0;
  }

  /**
   * Creates a component that will render the HydrateFallback from the module once it loads.
   * Falls back to a default loading message if the module doesn't export HydrateFallback.
   */
  constructor(
    kind: RouteKind,
    public readonly file: string,
    public readonly handle: RouterHandle = { route: {} },
  ) {
    super(kind);
    // Ensure handle.route exists
    if (!this.handle.route) {
      this.handle.route = {};
    }
  }

  toRouteObject(options?: LazyLoaderOptions): RouteObject {
    const initialHandle = options?.initial?.handle;
    const initial = {
      ...options?.initial,
      handle: {
        ...this.handle,
        route: {
          ...this.handle.route,
          ...initialHandle?.route,
        },
        // Preserve any other properties from initial handle (excluding route which we merged above)
        ...(initialHandle && Object.fromEntries(
          Object.entries(initialHandle).filter(([key]) => key !== 'route')
        )),
      },
    }
    return createLazyLoader(this.file, {
      ...options,
      initial,
    });
  }

  /**
   * Sets a description for the route.
   * @param description - Human-readable description of the route
   * @returns The route instance for method chaining
   */
  description(description: string) {
    this.handle.route.description = description;
    return this;
  }

  /**
   * Sets parameter schemas for dynamic route segments.
   * @param params - Schema definition for route parameters
   * @returns The route instance for method chaining
   */
  params(params: ParamsSchema) {
    this.handle.route.params = params;
    return this;
  }

  /**
   * Sets search parameter schemas for query string parameters.
   * @param search - Schema definition for search/query parameters
   * @returns The route instance for method chaining
   */
  search(search: SearchSchema) {
    this.handle.route.search = search;
    return this;
  }
}
