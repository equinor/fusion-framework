import type { Observable } from 'rxjs';

import type {
  AppModuleProvider,
  AppModulesInstance,
  FrameworkOptions,
} from '@equinor/fusion-framework-module-app';
import type {
  ContextModule,
  ContextItem,
  IContextProvider,
} from '@equinor/fusion-framework-module-context';
import type { INavigationProvider } from '@equinor/fusion-framework-module-navigation';

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
  /** Routing strategy declared in the app manifest's build options. */
  routingStrategy?: FrameworkOptions['contextRouting'];
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

// ─── Shared Comparator ──────────────────────────────────────────────

/**
 * Equality comparator for `ContextState` values in `distinctUntilChanged`.
 *
 * Returns `true` when the two states represent the same context identity,
 * preventing redundant reconciler emissions. Both `null` (cleared) and
 * `undefined` (initializing) are compared by reference; active contexts
 * are compared by `id`.
 */
export const contextStateChanged = (a: ContextState, b: ContextState): boolean => {
  if (a && b) return a.id === b.id;
  return a === b;
};
