import type { AppModulesInstance, AppModuleProvider } from '@equinor/fusion-framework-module-app';
import type { NavigationModule } from '@equinor/fusion-framework-module-navigation';
import type { ContextModule, IContextProvider } from '@equinor/fusion-framework-module-context';

import { Subscription, EMPTY, combineLatestWith, of, switchMap, tap } from 'rxjs';

import { CONTEXT_QUERY_PARAM_KEY, urlAlreadyHasContext } from './utils/url-utils';
import { contextNavigationOrchestrator } from './orchestrator/context-navigation-orchestrator';
import { mergeContextProviders } from './orchestrator/context-provider-adapter';
import type { resolveNavigationExecutor } from './navigation-executors';
import { parseAppRoute } from './utils/app-route';
import {
  ClearContextValue,
  NoContextValue,
  type ContextNavigationConfig,
  type TelemetryTracker,
} from './types';
import {
  resolveRoutingExecutionMode,
  type RoutingExecutionMode,
} from './orchestrator/routing-mode-orchestrator';
import path from 'path/posix';

/** Minimal telemetry surface — avoids hard coupling to the full telemetry module. */
type TelemetryTracking = TelemetryTracker;

/** Arguments required to construct a {@link ContextNavigationProvider}. */
export interface ContextNavigationProviderArgs {
  app: AppModuleProvider;
  navigation: import('@equinor/fusion-framework-module-navigation').INavigationProvider;
  context: IContextProvider;
  config: ContextNavigationConfig;
  telemetry?: TelemetryTracking;
}

/**
 * Snapshot of the currently loaded app's resolved providers and executor.
 */
interface AppSnapshot {
  appKey: string;
  activeContextProvider: IContextProvider;
  hasAppContextProvider: boolean;
  executor: ReturnType<typeof resolveNavigationExecutor>;
  appContextProvider?: IContextProvider;
}

// ─── Provider ───────────────────────────────────────────────────────

/**
 * Runtime provider that keeps the browser URL in sync with portal context.
 *
 * Two subscriptions drive the synchronization:
 *
 * 1. **Context-change sync** — when the portal context observable emits, the
 *    provider resolves the loaded app's routing strategy, computes the target
 *    URL, and navigates. On app switch, it strips stale context params from
 *    the URL left over by the previous app (configurable via
 *    `enableAppSwitchCarryOver`).
 *
 * 2. **Context URL guard** *(configurable)* — watches portal URL changes and
 *    re-applies the active context id when it goes missing from the URL.
 *    Only acts when the *app instance* has an active context — portal context
 *    is irrelevant from the guard's perspective. Uses `replace` so it is
 *    invisible in browser history.
 */
export class ContextNavigationProvider {
  private readonly _subscription = new Subscription();
  private readonly _config: ContextNavigationConfig;
  private readonly _telemetry: TelemetryTracking | null;
  private readonly _args: ContextNavigationProviderArgs;

  constructor(args: ContextNavigationProviderArgs) {
    this._config = args.config;
    // Config telemetry (resolved by configurator) wins, then explicit arg fallback
    this._telemetry = args.config.telemetry ?? args.telemetry ?? null;
    this._args = args;

    this._setupContextChangeSync();

    // if (args.config.enableContextUrlGuard) {
    //   this._setupContextUrlGuard();
    // }
  }

  // ── Subscription 1: Context-change sync ────────────────────────────

  private _setupContextChangeSync(): void {
    const source$ = this._config.sourceFactory({
      app: this._args.app,
      navigation: this._args.navigation,
      context: this._args.context,
    });
    const portalNavigation = this._args.navigation;
    const portalContextProvider = this._args.context;

    this._subscription.add(
      source$
        .pipe(
          tap(({ appModules, appKey, context }) => {
            this._log(`[app=${appKey}] source emission received.`);

            const mode = resolveRoutingExecutionMode({
              routingStrategy: appModules.context?.routingStrategy,
              hasAppContextPathGenerators:
                !!appModules.context?.extractContextIdFromPath &&
                !!appModules.context?.generatePathFromContext,
            });

            const contextStrategyAdapter = this._config.contextStrategyAdapters[mode];

            /**
             * Handle the "no context" case upfront.
             *
             * This is a common scenario during app initialization and deserves
             * special handling. Resolving it early also simplifies the "context
             * cleared" (null) path because we no longer need to worry about
             * stale context values in the URL conflicting with a cleared context.
             *
             * Semantics:
             * - `NoContextValue` → context not yet available (initializing)
             * - `ClearContextValue` → context intentionally cleared by the user
             *
             * Both cases are handled before any URL generation or navigation.
             */
            if (context === NoContextValue) {
              if (contextStrategyAdapter.onNonContext) {
                const instructions = contextStrategyAdapter.onNonContext({
                  appKey,
                  mode,
                  currentPathname: portalNavigation.path.pathname,
                  currentSearch: portalNavigation.path.search,
                });

                if (instructions) {
                  this._trackEvent('context-navigation.non-context-handled', { appKey, mode });
                  portalNavigation.navigate(instructions.pathname, { replace: true });
                  return;
                }

                this._log(
                  `Context is undefined and no onNonContext handler for [${appKey}] — skipping navigation.`,
                );

                this._trackEvent('context-navigation.non-context-no-handler', { appKey, mode });
                return;
              }

              const appContextProvider = appModules.context;
              const appNavigation = (
                appModules as AppModulesInstance<[ContextModule, NavigationModule]>
              ).navigation;

              /**
               * Handle app navigation events while context is still initializing (undefined).
               *
               * When an `appContextHandler` is registered on the strategy adapter,
               * it is invoked here so the portal can coordinate with app-level state
               * or trigger side effects before context resolves.
               *
               * This is especially useful for the `custom` strategy — the app
               * controls when context updates are emitted and may emit an initial
               * undefined context while still expecting the portal to respond to
               * app navigation events.
               *
               * **Note:** `portalContextHandler` is NOT called in this branch
               * because the portal context is irrelevant while the app context is
               * still initializing. The URL should reflect the app context as soon
               * as possible, but the portal context may not be usable at this point.
               */
              if (appContextProvider && contextStrategyAdapter.appContextHandler) {
                const appContextHandlerInstructions = contextStrategyAdapter.appContextHandler();

                if (!appContextHandlerInstructions) {
                  this._log(
                    `App context handler returned no instructions for [${appKey}] — skipping app navigation handling.`,
                  );
                  this._trackEvent('context-navigation.app-context-handled-no-instructions', {
                    appKey,
                  });
                  return;
                }

                // Guard: skip when the handler returns the current URL to prevent
                // an infinite navigate → emit → navigate loop.
                if (appContextHandlerInstructions.pathname === portalNavigation.path.pathname) {
                  this._log(
                    `App context handler returned the current pathname for [${appKey}] — skipping app navigation.`,
                  );
                  this._trackEvent('context-navigation.app-context-handled-current-path', {
                    appKey,
                  });
                  return;
                }

                this._log(
                  `🌍 Portal: Generated pathname for app navigation: ${appContextHandlerInstructions.pathname}`,
                );

                const appNavigationInstruction = contextStrategyAdapter.onAppNavigation?.({
                  appKey,
                  currentPathname: portalNavigation.path.pathname,
                  currentSearch: portalNavigation.path.search,
                });

                // The strategy adapter can override the app's navigation instruction,
                // e.g. to carry over context ids during an app switch. When no
                // override is returned, fall back to the app context handler's target.
                if (appNavigation && appNavigationInstruction) {
                  this._log(
                    `App navigation handler generated pathname: ${appNavigationInstruction.pathname} for [${appKey}]`,
                  );
                  appNavigation.navigate(appNavigationInstruction?.pathname, { replace: true });
                  this._trackEvent('context-navigation.app-navigation-handled', { appKey, mode });
                }

                portalNavigation.navigate(
                  appContextHandlerInstructions?.pathname ?? portalNavigation.path.pathname,
                  { replace: true },
                );
              }

              if (context === ClearContextValue) {
                this._log('Context is null — treating as cleared.');
                contextStrategyAdapter.onClearContext?.({
                  appKey,
                  mode,
                  currentPathname: portalNavigation.path.pathname,
                  currentSearch: portalNavigation.path.search,
                });
                this._trackEvent('context-navigation.context-cleared', { appKey, mode });
                return;
              }

              /**
               * Handle the "undefined context" case next, after checking for an app-level handler.
               *
               * This covers the scenario where context is still initializing but the app
               * doesn't have its own handler for that case. In this situation, it makes
               * sense to give the portal a chance to handle it before giving up and
               * skipping navigation — e.g. the portal might want to navigate to a
               * loading screen or trigger other side effects while waiting for context.
               *
               * The portal context handler is called here because the app context is not
               * yet available, so the portal context is the only relevant state for
               * deciding how to respond to navigation events during initialization.
               */
              if (portalContextProvider && contextStrategyAdapter.portalContextHandler) {
                const portalContextHandlerInstructions =
                  contextStrategyAdapter.portalContextHandler();

                if (!portalContextHandlerInstructions) {
                  this._log(
                    `Portal context handler returned no instructions for [${appKey}] — skipping navigation.`,
                  );
                  this._trackEvent('context-navigation.portal-context-handled-no-instructions', {
                    appKey,
                    mode,
                  });
                  return;
                }

                // Guard: skip when the handler returns the current URL to prevent
                // an infinite navigate → emit → navigate loop.
                if (portalContextHandlerInstructions.pathname === portalNavigation.path.pathname) {
                  this._log(
                    `Portal context handler returned the current pathname for [${appKey}] — skipping navigation.`,
                  );
                  this._trackEvent('context-navigation.portal-context-handled-current-path', {
                    appKey,
                    mode,
                  });
                  return;
                }

                this._log(
                  `Portal context handler generated pathname: ${portalContextHandlerInstructions?.pathname} for [${appKey}]`,
                );

                if (portalContextHandlerInstructions) {
                  portalNavigation.navigate(portalContextHandlerInstructions.pathname, {
                    replace: true,
                  });
                  this._trackEvent('context-navigation.portal-context-handled', { appKey, mode });
                  return;
                }

                this._log(
                  `Portal context handler returned no instructions for [${appKey}] — skipping navigation.`,
                );
                this._trackEvent('context-navigation.portal-context-handled-no-instructions', {
                  appKey,
                  mode,
                });
                return;
              }

              this._trackEvent('context-navigation.context-emission-unhandled', { appKey, mode });
              this._log(
                `No handlers for context emission in [${appKey}] with mode [${mode}] — skipping navigation.`,
              );
              return;
            }
          }),
        )
        .subscribe(),
    );
  }

  // ── Subscription 2: Context URL guard ──────────────────────────────
  //
  // Fires when:  the portal URL changes (navigation.state$)
  // Purpose:     When an app accidentally drops the context id from the
  //              URL during in-app navigation, this guard re-applies it
  //              via replace so the URL stays shareable.
  //
  // Only acts when:
  //  - An app is loaded with a non-custom routing strategy
  //  - A context is currently active
  //  - The URL does NOT already contain the active context id
  //
  // Uses the same orchestrator/strategy pipeline as subscription 1 to
  // compute the correct URL shape, preserving all existing query params
  // and sub-routes.

  private _setupContextUrlGuard(): void {
    const { app: appModule, navigation: portalNavigation } = this._args;

    // Combine portal URL changes with the current loaded app's modules.
    // switchMap on app.current$ → instance$ gives us the app's routing
    // strategy; combineLatestWith state$ triggers on every URL change.
    this._subscription.add(
      appModule.current$
        .pipe(
          switchMap((currentApp) => {
            if (!currentApp) return EMPTY;
            return currentApp.instance$.pipe(
              switchMap((appModules) => {
                if (!appModules) return EMPTY;
                return of({
                  appModules: appModules as AppModulesInstance<[ContextModule]>,
                  appKey: currentApp.appKey,
                });
              }),
            );
          }),
          combineLatestWith(portalNavigation.state$),
          tap(([{ appModules, appKey }]) => {
            // Use the app's own context — only guard when the app has
            // actually resolved a context. Portal context is irrelevant;
            // the URL should reflect what the app instance has active.
            const appContext = appModules.context?.currentContext;
            const contextId = appContext?.id;
            if (!contextId) return;

            // Bail out when the URL is no longer within the tracked app's
            // route scope — the user (or portal) is navigating away.
            const route = parseAppRoute(portalNavigation.path.pathname);
            if (!route || route.appKey !== appKey) return;

            const snapshot = this._resolveAppSnapshot(appModules, appKey);

            // Custom strategy apps own their URL — don't interfere
            const strategy = snapshot.activeContextProvider.routingStrategy;
            if (strategy === 'custom') return;

            const currentPathname = snapshot.executor.workingPathname;
            const currentSearch = snapshot.executor.workingSearch;

            // Context is already in the URL — nothing to fix
            if (
              urlAlreadyHasContext(
                { pathname: currentPathname, search: currentSearch },
                snapshot.activeContextProvider,
                contextId,
              )
            ) {
              return;
            }

            this._log(
              `[app=${appKey}] URL guard — context [${contextId}] missing from URL, re-applying.`,
            );

            // Re-use the orchestrator to compute the correct URL shape,
            // preserving existing query params and sub-routes.
            const { mode, instruction } = contextNavigationOrchestrator.onContextChange({
              newContext: appContext,
              activeContextProvider: snapshot.activeContextProvider,
              hasAppContextProvider: snapshot.hasAppContextProvider,
              portalPathname: currentPathname,
              portalSearch: currentSearch,
            });

            if (!instruction) return;

            snapshot.executor.execute(appContext, instruction);

            this._trackEvent('context-navigation.url-guard', {
              appKey,
              mode,
              executorType: snapshot.executor.type,
              contextId,
              pathname: instruction.pathname,
            });
          }),
        )
        .subscribe(),
    );
  }

  // ── Internal helpers ───────────────────────────────────────────────

  /**
   * Strips stale `$contextId` from the URL when carry-over is skipped.
   * The portal may preserve query params from the previous app during
   * navigation — this cleans up context params that don't belong.
   */
  private _stripStaleContextFromUrl(snapshot: AppSnapshot): void {
    const search = snapshot.executor.workingSearch;
    if (!search.includes(CONTEXT_QUERY_PARAM_KEY)) return;

    const params = new URLSearchParams(search.replace(/^\?/, ''));
    params.delete(CONTEXT_QUERY_PARAM_KEY);
    const cleanSearch = params.toString();

    snapshot.executor.execute(null, {
      pathname: snapshot.executor.workingPathname,
      search: cleanSearch ? `?${cleanSearch}` : '',
    });

    this._log(`Stripped stale $contextId from URL for [${snapshot.appKey}].`);
  }

  private _handleStrategyDetected(appKey: string, mode: RoutingExecutionMode): void {
    this._log(`Strategy [${mode}] active for [${appKey}].`);
    this._warnOnStrategy(appKey, mode);
    this._config.onStrategyDetected?.(appKey, mode);
    this._trackEvent('context-navigation.strategy-detected', { appKey, mode });
  }
  private _log(message: string): void {
    if (this._config.consoleDebug) {
      console.debug(`🌍 ${this._config.portalName}: ${message}`);
    }
  }

  private _warnOnStrategy(appKey: string, mode: RoutingExecutionMode): void {
    if (this._config.warnOnStrategies.includes(mode)) {
      console.warn(
        `🌍 ${this._config.portalName}:`,
        `App [${appKey}] uses '${mode}' context routing strategy.`,
      );
    }
  }
  private _trackEvent(name: string, properties: Record<string, string>): void {
    this._telemetry?.trackEvent({ name, properties });
  }

  dispose(): void {
    this._subscription.unsubscribe();
  }
}
