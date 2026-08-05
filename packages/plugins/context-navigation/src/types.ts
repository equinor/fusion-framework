import type { ContextItem, IContextProvider } from '@equinor/fusion-framework-module-context';
import type { AppModulesInstance } from '@equinor/fusion-framework-module-app';
import type { ContextModule } from '@equinor/fusion-framework-module-context';
import type { INavigationProvider } from '@equinor/fusion-framework-module-navigation';

import type { ContextNavigationAdapterInput } from './adapters/types';
import type { ReconcilerSourceFactory } from './sources/types';

// Re-export domain types so existing consumers and index.ts don't break.
export type {
  AdapterResolutionContext,
  ContextNavigationAdapter,
  ContextNavigationAdapterFactory,
  ContextNavigationAdapterInput,
} from './adapters/types';

export type {
  ContextState,
  ReconcilerPhase,
  ReconcilerSourceEntry,
  ReconcilerSourceDeps,
  ReconcilerSourceFactory,
} from './sources/types';

// ─── Events ─────────────────────────────────────────────────────────

/** Fired before reconciliation navigates. Cancelable. */
export interface ContextNavigationNavigateDetail {
  appKey: string;
  adapterId: string;
  targetURL: URL;
  sourceURL: URL;
  context: ContextItem | null;
  /** The current app's loaded module instances. */
  appModules: AppModulesInstance<[ContextModule]>;
}

/** Fired after navigation completes. */
export interface ContextNavigationNavigatedDetail {
  appKey: string;
  adapterId: string;
  targetURL: URL;
  context: ContextItem | null;
  /** The current app's loaded module instances. */
  appModules: AppModulesInstance<[ContextModule]>;
}

/** Fired when an adapter is resolved for an app. */
export interface ContextNavigationAdapterResolvedDetail {
  appKey: string;
  adapterId: string;
}

/** Fired when reconciliation skips. */
export interface ContextNavigationSkippedDetail {
  appKey: string;
  reason: 'url-matches' | 'no-context' | 'no-adapter' | 'encode-returned-null' | 'canceled';
}

// ─── Configuration ──────────────────────────────────────────────────

export interface ContextNavigationConfig {
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
  onTransition?: (detail: ContextNavigationNavigatedDetail) => void;

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

  /**
   * Options passed to `navigation.navigate()` when the reconciler performs URL updates.
   *
   * @default { replace: true }
   */
  navigationOptions: { replace?: boolean; state?: unknown };
}
