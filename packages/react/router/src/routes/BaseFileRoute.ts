import type { RouteFileNode, RouteKind, RouterHandle } from '../types.js';
import { BaseRoute } from './BaseRoute.js';

/**
 * Base abstract class for file-based routes.
 * Handles lazy loading of route components from file paths or import functions.
 *
 * ## Supported file-route exports
 *
 * The Vite plugin (`reactRouterPlugin`) scans each route file for the following named exports
 * and wires them into the generated React Router data route automatically.
 *
 * | Export | Type | Description |
 * |---|---|---|
 * | `default` | `React.ComponentType` | **Required.** The page / route component. |
 * | `clientLoader` | `LoaderFunctionArgs => MaybePromise<unknown>` | Route loader — called before the component renders. Receives `fusion` context. |
 * | `action` | `ActionFunctionArgs => MaybePromise<unknown>` | Route action — handles form submissions and mutations. Receives `fusion` context. |
 * | `handle` | `RouterHandle` | Arbitrary route metadata attached to `useMatches()` entries. |
 * | `ErrorElement` | `React.ComponentType<ErrorElementProps>` | Component rendered when this route or a descendant throws. Receives `error` and `fusion` props. |
 * | `HydrateFallback` | `React.ComponentType` | Component rendered during client-side hydration before `clientLoader` resolves. |
 *
 * Any export not in the table above is ignored by the plugin.
 *
 * @example
 * ```tsx
 * // src/pages/ProductPage.tsx
 * import type { LoaderFunctionArgs, ErrorElementProps } from '@equinor/fusion-framework-react-router';
 *
 * export async function clientLoader({ params, fusion }: LoaderFunctionArgs) { ... }
 *
 * export function ErrorElement({ error }: ErrorElementProps) {
 *   return <p>Error: {String(error)}</p>;
 * }
 *
 * export default function ProductPage() { ... }
 * ```
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
   * @param file - Path to the module that exports the route component and any supported named exports
   *   (`clientLoader`, `action`, `handle`, `ErrorElement`, `HydrateFallback`). See the class-level
   *   docs for the full export table.
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
