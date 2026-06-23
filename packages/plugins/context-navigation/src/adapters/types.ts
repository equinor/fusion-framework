import type { ContextItem, IContextProvider } from '@equinor/fusion-framework-module-context';
import type { FrameworkOptions } from '@equinor/fusion-framework-module-app';

// ─── Adapter Contract ───────────────────────────────────────────────

/**
 * Context for adapter resolution — passed to `canHandle` so the adapter
 * can self-select based on app config, URL shape, or other signals.
 */
export interface AdapterResolutionContext {
  /** Current app key. */
  appKey: string;
  /** The app's context provider (has custom generators, etc.) */
  appContext: IContextProvider;
  /** Routing strategy declared in the app manifest's build options. */
  routingStrategy?: FrameworkOptions['contextRouting'];
  /** The current browser URL. */
  currentURL: URL;
}

/**
 * A context navigation adapter encodes/decodes context identity in the URL.
 *
 * Adapters are **self-selecting** — they declare via `canHandle` whether they
 * apply to a given app/URL combination. The provider iterates registered
 * adapters by priority and uses the first match.
 *
 * Implementations must be **pure** — no side effects, no navigation calls.
 * The reconciler handles all navigation; adapters only compute URLs.
 */
export interface ContextNavigationAdapter {
  /** Unique identifier for logging/events. */
  readonly id: string;

  /**
   * Self-selecting predicate: should this adapter handle navigation for
   * the given app and URL?
   */
  canHandle(ctx: AdapterResolutionContext): boolean;

  /**
   * Build a URL that encodes the given context.
   *
   * @param args.context - The context to encode, or `null` to clear context from URL.
   * @param args.currentURL - The current browser URL (absolute).
   * @returns The target URL with context encoded, or `null` to skip navigation.
   */
  encode(args: { context: ContextItem | null; currentURL: URL }): URL | null;

  /**
   * Extract the context id from a URL.
   *
   * @param url - The URL to decode.
   * @returns The context id if present, or `null` if not found.
   */
  decode(url: URL): string | null;
}

/**
 * An adapter factory receives the resolution context and returns a
 * fully-bound adapter, or `null` to indicate it cannot handle
 * the current app/URL combination.
 *
 * Use a factory when the adapter needs runtime state from the app
 * (e.g. custom path generators) that isn't available at registration time.
 */
export type ContextNavigationAdapterFactory = (
  ctx: AdapterResolutionContext,
) => ContextNavigationAdapter | null;

/**
 * An adapter registration — either a static adapter object or a factory
 * function that produces one.
 *
 * - **Object** — must implement `canHandle`, `encode`, `decode`.
 *   The reconciler calls `canHandle` to determine if it applies.
 * - **Function** — called with the resolution context, returns a bound
 *   adapter or `null` to skip. Implies the factory handles its own selection.
 */
export type ContextNavigationAdapterInput =
  | ContextNavigationAdapter
  | ContextNavigationAdapterFactory;
