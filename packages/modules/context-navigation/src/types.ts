import type { Observable } from 'rxjs';
import type { AppModulesInstance } from '@equinor/fusion-framework-module-app';
import type {
  ContextModule,
  ContextItem,
  IContextProvider,
} from '@equinor/fusion-framework-module-context';
import type { RoutingExecutionMode } from './orchestrator/routing-mode-orchestrator';
import type { NavigationInstruction } from './strategy-adapters/contracts';

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
 * Called when context is cleared (null). Returns a navigation instruction
 * that replaces the default adapter behavior, or `undefined` to fall through.
 *
 * App-portal default: `{ pathname: '/apps/{appKey}/' }`
 * Context-portal override: `{ pathname: '/' }`
 */
export type NullContextHandler = (args: {
  appKey: string;
  mode: RoutingExecutionMode;
  currentPathname: string;
  currentSearch: string;
}) => NavigationInstruction | undefined;

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
   * Factory that builds the primary observable for subscription 1.
   * Default: `createAppFirstSource()` — app.current$ × context$.
   * Context-portal: `createContextFirstSource()` — context$ × app.current$.
   */
  sourceFactory: SourceFactory;

  /**
   * Whether to enable app-switch carry-over (Subscription 2).
   * When enabled, navigating to a bare app route auto-appends the current context id.
   * @default true
   */
  enableAppSwitchCarryOver: boolean;

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

  /**
   * Called when context is cleared (null). Returns a navigation instruction
   * that overrides the default adapter behavior, or `undefined` to fall through
   * to the strategy adapter's default.
   */
  nullContextHandler?: NullContextHandler;
}
