import type { Observable } from 'rxjs';
import type { AppModulesInstance } from '@equinor/fusion-framework-module-app';
import type {
  ContextModule,
  ContextItem,
  IContextProvider,
} from '@equinor/fusion-framework-module-context';
import type { RoutingExecutionMode } from './orchestrator/routing-mode-orchestrator';
import type {
  ContextChangeStrategyInput,
  IContextNavigationStrategyAdapter,
  NavigationInstruction,
} from './strategy-adapters/contracts';
import type { INavigationProvider } from '@equinor/fusion-framework-module-navigation';

/**
 * Callback invoked when a routing strategy is detected on a loaded app.
 * Portals decide what to do: warn, log, report to telemetry, etc.
 */
export type OnStrategyDetectedCallback = (appKey: string, mode: RoutingExecutionMode) => void;

/**
 * Minimal telemetry surface — avoids hard coupling to the full telemetry module.
 * Portals can supply a custom implementation via `setTelemetry()`.
 */
export interface TelemetryTracker {
  // biome-ignore lint/suspicious/noExplicitAny: minimal structural contract for telemetry integration
  trackEvent(item: { name: string; properties?: Record<string, any> } & Record<string, any>): void;
}

/**
 * Emission from the source factory — the single data shape that drives
 * context-to-URL synchronization in subscription 1.
 *
 * Both `createAppFirstSource` and `createContextFirstSource` produce this
 * same shape so the provider doesn't need to know which order the
 * observables were composed in.
 */
export interface ContextNavigationSourceEmission {
  appModules: AppModulesInstance<[ContextModule]>;
  appKey: string;
  context: ContextItem | null | undefined;
}

/**
 * Dependencies available to the source factory.
 * Passed by the provider at subscription time.
 */
export interface SourceFactoryDeps {
  app: import('@equinor/fusion-framework-module-app').AppModuleProvider;
  navigation: import('@equinor/fusion-framework-module-navigation').INavigationProvider;
  context: IContextProvider;
}

/**
 * Factory that builds the primary observable driving context-to-URL sync.
 *
 * The default factory (`createAppFirstSource`) composes `app.current$` as
 * primary and `context$` as secondary. Context-portal swaps the order via
 * `createContextFirstSource`.
 *
 * Portals override this via `builder.setSourceFactory(...)`.
 */
export type SourceFactory = (
  deps: SourceFactoryDeps,
) => Observable<ContextNavigationSourceEmission>;

export type AppNavigationHandler = (args: { appNavigation?: INavigationProvider }) => void;

export type NullContextHandler = (args: {
  appKey: string;
  mode: RoutingExecutionMode;
  currentPathname: string;
  currentSearch: string;
}) => NavigationInstruction | undefined;

export type UndefinedContextHandler = (args: {
  portalNavigation: INavigationProvider;
  appKey?: string;
}) => void;

export type ContextStrategyAdapters<T extends RoutingExecutionMode> = Record<
  T,
  IContextNavigationStrategyAdapter<T>
>;

/**
 * Configuration for the context navigation module.
 */
export interface ContextNavigationConfig {
  /**
   * Human-readable name for the portal consuming this module.
   * Used as a prefix in console.debug and console.warn output
   * to distinguish logs from different portals.
   * @default 'Portal'
   */
  portalName: string;

  /**
   * Origin to use for generated URLs — defaults to `window.location.origin`.
   * Used in strategy adapters when constructing URL objects to ensure they
   * are absolute and compatible with the navigation providers.
   * Portals can set this to a custom value for testing or non-browser environments.
   * Note: this is not the same as the `basePath` used by the navigation providers,
   * which is handled separately in the adapters.
   * @default window.location.origin
   */
  origin: string;

  /**  * Default routing mode to assume when an app doesn't specify one.
   * The provider uses this as a fallback in several places to decide how to
   * handle navigation for apps with no declared strategy.
   *
   * Defaults to 'path' for maximum compatibility, but portals can set it to
   * 'query' to encourage modern strategies and better URL hygiene.
   */
  defaultRoutingMode: RoutingExecutionMode;

  /**
   * Optional portal-level override for null context (cleared).
   * Fires before the strategy adapter's `onClearContext`.
   * Return a navigation instruction to handle it, or `undefined` to
   * fall through to the adapter.
   */
  nullContextHandler?: NullContextHandler;

  /**
   * Factory that builds the primary observable for subscription 1.
   * Default: `createAppFirstSource()` — app.current$ × context$.
   * Context-portal: `createContextFirstSource()` — context$ × app.current$.
   */
  sourceFactory: SourceFactory;

  /**
   * Optional callback fired when a routing strategy is detected on a loaded app.
   * Fires for every strategy mode, not just custom — portals decide which modes
   * deserve special handling.
   */
  onStrategyDetected?: OnStrategyDetectedCallback;

  /**
   * List of routing execution modes that trigger a `console.warn` when detected.
   *
   * For example, Fusion Portal sets `['custom']` to discourage apps from using
   * custom URL strategies. Other portals might warn on `['legacy']` instead.
   *
   * @default []
   */
  warnOnStrategies: RoutingExecutionMode[];

  /**
   * Enable verbose console.debug output for context navigation.
   * Useful for development; keep disabled in production.
   * @default false
   */
  consoleDebug: boolean;

  /**
   * Custom telemetry tracker override.
   *
   * By default, the provider uses the framework telemetry module if registered.
   * Set this to provide a custom tracker instead of the framework default.
   *
   * Events tracked:
   * - `context-navigation.context-change` — strategy, mode, appKey, executorType
   * - `context-navigation.app-switch` — carry-over result, appKey, contextId
   * - `context-navigation.strategy-detected` — appKey, mode
   */
  telemetry?: TelemetryTracker;

  /**
   * Enable the URL guard (Subscription 3).
   *
   * When enabled, the provider watches portal URL changes and re-applies the
   * active context id whenever it goes missing — e.g. an app accidentally
   * navigates without preserving the `$contextId` query parameter or
   * path segment. The correction uses `replace` (not push) so it stays
   * invisible in the browser history and keeps the URL shareable.
   *
   * Only fires when an app is loaded and has a non-custom routing strategy.
   *
   * @default true
   */
  enableContextUrlGuard: boolean;

  contextStrategyAdapters: ContextStrategyAdapters<RoutingExecutionMode>;
}

export const NoContextValue = undefined;
export type NoContext = typeof NoContextValue;

export const ClearContextValue = null;
export type ClearContext = typeof ClearContextValue;
