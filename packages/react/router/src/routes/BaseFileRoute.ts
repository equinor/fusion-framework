import type { RouteFileNode, RouteKind, RouterHandle } from '../types.js';
import { BaseRoute } from './BaseRoute.js';

/**
 * Base abstract class for file-based routes.
 * Handles lazy loading of route components from file paths or import functions.
 */
export abstract class BaseFileRoute extends BaseRoute implements RouteFileNode {
  /**
   * Type guard that checks whether a value is a file-based route node.
   *
   * @param node - The value to check.
   * @returns `true` if `node` is an instance of `BaseFileRoute` or structurally conforms to {@link RouteFileNode}.
   */
  static isFileRoute(node: unknown): node is BaseFileRoute {
    if (node instanceof BaseFileRoute) {
      return true;
    }
    const alias = node as RouteFileNode;
    return 'file' in alias && typeof alias.file === 'string' && alias.file.length > 0;
  }

  /**
   * @param kind - The kind of route node (`'route'`, `'index'`, `'layout'`, etc.).
   * @param file - Path to the module that exports the route component (and optionally `clientLoader`, `action`, `handle`, `ErrorElement`).
   * @param handle - Optional route handle metadata. Defaults to `{ route: {} }`.
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
