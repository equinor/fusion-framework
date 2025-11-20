import type { RouteFileNode, RouteKind, RouterHandle } from '../types.js';
import { BaseRoute } from './BaseRoute.js';

/**
 * Base abstract class for file-based routes.
 * Handles lazy loading of route components from file paths or import functions.
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
}
