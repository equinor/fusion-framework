import type { ContextItem, IContextProvider } from '@equinor/fusion-framework-module-context';
import type { INavigationProvider } from '@equinor/fusion-framework-module-navigation';
import type { AppModuleProvider, AppModulesInstance } from '@equinor/fusion-framework-module-app';
import type { ContextModule } from '@equinor/fusion-framework-module-context';
import type { Observable } from 'rxjs';

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

// ─── Source Factory ─────────────────────────────────────────────────

/**
 * A single reconciliation entry emitted by the source factory.
 *
 * Contains everything the reconciler needs to decide whether and how
 * to navigate.
 */
export interface ReconcilerSourceEntry {
  /** Current app key. */
  appKey: string;
  /** The app's loaded module instances (must include context). */
  appModules: AppModulesInstance<[ContextModule]>;
  /** The portal-level context state driving reconciliation. */
  contextState: ContextState;
}

/**
 * Dependencies injected into a source factory.
 */
export interface ReconcilerSourceDeps {
  /** The app module provider (for watching app switches). */
  app: AppModuleProvider;
  /** The portal's context provider (for watching context changes). */
  context: IContextProvider;
  /** The navigation provider (for reading current URL). */
  navigation: INavigationProvider;
}

/**
 * A source factory produces the observable stream that drives the reconciler.
 *
 * The stream composition determines **what leads** — app switches or context
 * changes — making it the primary extension point for portal-specific behavior.
 *
 * Built-in factories:
 * - `createAppFirstSource` — app switches lead, context follows (app-portal)
 * - `createContextFirstSource` — context changes lead, app follows (context-portal)
 */
export type ReconcilerSourceFactory = (
  deps: ReconcilerSourceDeps,
) => Observable<ReconcilerSourceEntry>;

// ─── Events ─────────────────────────────────────────────────────────

/** Fired before reconciliation navigates. Cancelable. */
export interface ContextNavigationHandlerNavigateDetail {
  appKey: string;
  adapterId: string;
  targetURL: URL;
  sourceURL: URL;
  context: ContextItem | null;
  /** The current app's loaded module instances. */
  appModules: AppModulesInstance<[ContextModule]>;
}

/** Fired after navigation completes. */
export interface ContextNavigationHandlerNavigatedDetail {
  appKey: string;
  adapterId: string;
  targetURL: URL;
  context: ContextItem | null;
  /** The current app's loaded module instances. */
  appModules: AppModulesInstance<[ContextModule]>;
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
   * Registered adapters in evaluation order.
   * Each entry is either a static adapter object or a factory function.
   */
  adapters: ContextNavigationAdapterInput[];

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
   * @param args.context - The portal's context provider.
   * @param args.navigation - The navigation provider (for reading the current URL).
   */
  resolveInitialContext?: (args: {
    context: IContextProvider;
    navigation: INavigationProvider;
  }) => Promise<void>;

  /**
   * Factory that produces the observable stream driving the reconciler.
   *
   * Controls whether app switches or context changes lead the stream,
   * which is the primary behavioral difference between app-portal and
   * context-portal.
   *
   * @default createAppFirstSource()
   * @see createAppFirstSource
   * @see createContextFirstSource
   */
  sourceFactory: ReconcilerSourceFactory;

  /**
   * Compute the URL to navigate to when context is cleared (`null`).
   *
   * When set, the reconciler calls this function on null context instead
   * of delegating to the adapter's `encode(null, ...)`.
   *
   * Typical usage: context-portal returns `'/'` so clearing context
   * returns to the portal landing page regardless of adapter type.
   *
   * @param args.appKey - The current app key.
   * @param args.currentURL - The current browser URL.
   * @returns The target URL path string (e.g. `'/'` or `/apps/${appKey}`).
   *
   * @default undefined — adapters handle null context themselves
   */
  nullContextUrl?: (args: { appKey: string; currentURL: URL }) => string;
}
