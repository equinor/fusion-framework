import type { ContextItem, IContextProvider } from '@equinor/fusion-framework-module-context';
import type { INavigationProvider } from '@equinor/fusion-framework-module-navigation';

// ─── Adapter Contract ───────────────────────────────────────────────

/**
 * Context for adapter resolution — passed to `canHandle` so the adapter
 * can self-select based on app config, URL shape, or other signals.
 */
export interface AdapterResolutionContext {
  /** Current app key. */
  appKey: string;
  /** The app's context provider (has routingStrategy, generators, etc.) */
  appContext: IContextProvider;
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
   * @param context - The context to encode, or `null` to clear context from URL.
   * @param currentURL - The current browser URL (absolute).
   * @returns The target URL with context encoded, or `null` to skip navigation.
   */
  encode(context: ContextItem | null, currentURL: URL): URL | null;

  /**
   * Extract the context id from a URL.
   *
   * @param url - The URL to decode.
   * @returns The context id if present, or `null` if not found.
   */
  decode(url: URL): string | null;
}

// ─── Context States ─────────────────────────────────────────────────

/**
 * The reconciler's view of context state.
 *
 * - `undefined` — context not yet resolved (initializing)
 * - `null` — context intentionally cleared
 * - `ContextItem` — active context
 */
export type ContextState = ContextItem | null | undefined;

// ─── Reconciler State Machine ───────────────────────────────────────

export type ReconcilerPhase = 'idle' | 'active' | 'cleared';

// ─── Events ─────────────────────────────────────────────────────────

/** Fired before reconciliation navigates. Cancelable. */
export interface ContextNavigationHandlerNavigateDetail {
  appKey: string;
  adapterId: string;
  targetURL: URL;
  sourceURL: URL;
  context: ContextItem | null;
}

/** Fired after navigation completes. */
export interface ContextNavigationHandlerNavigatedDetail {
  appKey: string;
  adapterId: string;
  targetURL: URL;
  context: ContextItem | null;
}

/** Fired when an adapter is resolved for an app. */
export interface ContextNavigationHandlerAdapterResolvedDetail {
  appKey: string;
  adapterId: string;
}

/** Fired when reconciliation skips. */
export interface ContextNavigationHandlerSkippedDetail {
  appKey: string;
  reason: 'url-matches' | 'no-context' | 'no-adapter' | 'encode-returned-null' | 'canceled';
}

// ─── Configuration ──────────────────────────────────────────────────

export interface ContextNavigationHandlerConfig {
  /**
   * Human-readable name for the portal consuming this module.
   * Used in debug logging.
   * @default 'Portal'
   */
  portalName: string;

  /**
   * Origin for constructing absolute URLs.
   * @default window.location.origin
   */
  origin: string;

  /**
   * Registered adapters, sorted by priority (highest first).
   */
  adapters: ContextNavigationAdapter[];

  /**
   * Enable reconciliation on URL changes (guard behavior).
   * @default true
   */
  enableUrlGuard: boolean;

  /**
   * Enable verbose debug logging.
   * @default false
   */
  debug: boolean;

  /**
   * Optional side-effect hook called after navigation completes.
   */
  onTransition?: (detail: ContextNavigationHandlerNavigatedDetail) => void;

  /**
   * Resolves the initial context from the URL and sets it on the context
   * provider before the reconciler activates.
   *
   * The default implementation iterates registered adapters, decodes the
   * first matching context ID, and calls `setCurrentContextByIdAsync`.
   * Override to customise initial context resolution or disable it by
   * setting to `undefined`.
   *
   * @param context - The portal's context provider.
   * @param navigation - The navigation provider (for reading the current URL).
   */
  resolveInitialContext?: (
    context: IContextProvider,
    navigation: INavigationProvider,
  ) => Promise<void>;
}
