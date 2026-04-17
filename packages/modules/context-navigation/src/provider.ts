import type { AppModulesInstance, AppModuleProvider } from '@equinor/fusion-framework-module-app';
import type { NavigationModule } from '@equinor/fusion-framework-module-navigation';
import type { ContextModule, IContextProvider } from '@equinor/fusion-framework-module-context';

import {
  Subscription,
  EMPTY,
  combineLatestWith,
  distinctUntilChanged,
  of,
  switchMap,
  tap,
} from 'rxjs';

import {
  readContextIdFromAppPath,
  readContextIdFromQueryParam,
  urlAlreadyHasContext,
} from './utils/url-utils';
import { contextNavigationOrchestrator } from './orchestrator/context-navigation-orchestrator';
import { mergeContextProviders } from './orchestrator/context-provider-adapter';
import { resolveNavigationExecutor } from './navigation-executors';
import { buildAppRoute, parseAppRoute } from './utils/app-route';
import type { ContextNavigationConfig, TelemetryTracker } from './types';
import type { RoutingExecutionMode } from './orchestrator/routing-mode-orchestrator';

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
}

// ─── Provider ───────────────────────────────────────────────────────

/**
 * Runtime provider that keeps the browser URL in sync with portal context.
 *
 * Three subscriptions drive the synchronization:
 *
 * 1. **Context-change sync** — when the portal context observable emits, the
 *    provider resolves the loaded app's routing strategy, computes the target
 *    URL, and navigates.
 *
 * 2. **App-switch carry-over** *(configurable)* — when `app.current$` emits
 *    a new app, the provider carries the current context id forward into the
 *    bare portal URL so the target app loads in-context immediately.
 *    Uses `current$` (not `state$`) because portal and app navigation are
 *    separate — the app router adds sub-routes after loading.
 *
 * 3. **Context URL guard** *(configurable)* — watches portal URL changes and
 *    re-applies the active context id when it goes missing from the URL.
 *    Ensures the URL stays shareable when an app accidentally drops the
 *    context parameter during in-app navigation. Uses `replace` so it is
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

    if (args.config.enableAppSwitchCarryOver) {
      this._setupAppSwitchCarryOver();
    }

    if (args.config.enableContextUrlGuard) {
      this._setupContextUrlGuard();
    }
  }

  // ── Shared resolution ──────────────────────────────────────────────

  private _resolveAppSnapshot(
    appModules: AppModulesInstance<[ContextModule]>,
    appKey: string,
  ): AppSnapshot {
    const appContextProvider = appModules.context;
    const appNavigation = (appModules as AppModulesInstance<[ContextModule, NavigationModule]>)
      .navigation;

    return {
      appKey,
      hasAppContextProvider: !!appContextProvider,
      activeContextProvider: mergeContextProviders(appContextProvider, this._args.context),
      executor: resolveNavigationExecutor(appNavigation, this._args.navigation, appKey),
    };
  }

  // ── Subscription 1: Context-change sync ────────────────────────────

  private _setupContextChangeSync(): void {
    const source$ = this._config.sourceFactory({
      app: this._args.app,
      navigation: this._args.navigation,
      context: this._args.context,
    });

    this._subscription.add(
      source$
        .pipe(
          tap(({ appModules, appKey, context }) => {
            this._log(`[app=${appKey}] source emission received.`);

            if (context === undefined) {
              this._log('Context is still initializing — skipping.');
              return;
            }

            const snapshot = this._resolveAppSnapshot(appModules, appKey);
            this._log(`Using [${snapshot.executor.type}] executor for [${appKey}].`);

            // ── Null context → nullContextHandler override ──
            if (context === null && this._config.nullContextHandler) {
              const { mode } = contextNavigationOrchestrator.onContextChange({
                newContext: context,
                activeContextProvider: snapshot.activeContextProvider,
                hasAppContextProvider: snapshot.hasAppContextProvider,
                portalPathname: snapshot.executor.workingPathname,
                portalSearch: snapshot.executor.workingSearch,
              });

              const override = this._config.nullContextHandler({
                appKey,
                mode,
                currentPathname: snapshot.executor.workingPathname,
                currentSearch: snapshot.executor.workingSearch,
              });

              if (override) {
                snapshot.executor.execute(context, override);
                this._trackEvent('context-navigation.context-change', {
                  appKey,
                  mode,
                  executorType: snapshot.executor.type,
                  pathname: override.pathname,
                });
                return;
              }
            }

            // ── Orchestrator handles all context states (including null) ──
            const { mode, instruction } = contextNavigationOrchestrator.onContextChange({
              newContext: context,
              activeContextProvider: snapshot.activeContextProvider,
              hasAppContextProvider: snapshot.hasAppContextProvider,
              portalPathname: snapshot.executor.workingPathname,
              portalSearch: snapshot.executor.workingSearch,
            });

            if (!instruction) {
              this._handleStrategyDetected(appKey, mode);
              return;
            }

            snapshot.executor.execute(context, instruction);

            this._trackEvent('context-navigation.context-change', {
              appKey,
              mode,
              executorType: snapshot.executor.type,
              pathname: instruction.pathname,
            });
          }),
        )
        .subscribe(),
    );
  }

  // ── Subscription 2: App-switch carry-over ──────────────────────────
  //
  // Fires when:  the current app changes (appModule.current$)
  // Purpose:     When the user switches to a different app, carry the
  //              current context id into the new app's portal URL.
  //
  // Uses current$ (not state$) because portal and app navigation are
  // separate — the app router will add sub-routes after loading. state$
  // fires on every internal URL tick, but current$ fires once per app
  // change, before the app router starts.

  private _setupAppSwitchCarryOver(): void {
    const { app: appModule, context: portalContext, navigation: portalNavigation } = this._args;
    let previousAppKey: string | undefined;

    this._subscription.add(
      appModule.current$
        .pipe(distinctUntilChanged((a, b) => a?.appKey === b?.appKey))
        .subscribe((currentApp) => {
          const newAppKey = currentApp?.appKey;

          // First emission or app cleared — just track and skip
          if (!newAppKey || previousAppKey === undefined) {
            previousAppKey = newAppKey;
            return;
          }

          // Same app — not a switch
          if (newAppKey === previousAppKey) {
            previousAppKey = newAppKey;
            return;
          }

          previousAppKey = newAppKey;

          // Resolve context to carry — portal context is source of truth
          // since the new app hasn't loaded yet
          const contextId =
            portalContext.currentContext?.id ??
            readContextIdFromAppPath(portalNavigation.path.pathname) ??
            readContextIdFromQueryParam(portalNavigation.path.search);

          if (!contextId) {
            this._log('App switch detected, but no context to carry.');
            return;
          }

          // Inject context into the bare portal route. At this point the
          // app hasn't loaded yet so we can't know its routing strategy —
          // use the portal's default path shape. Subscription 1 will
          // correct the URL once the app and its strategy are available.
          const targetPathname = buildAppRoute(newAppKey, contextId);
          const currentPathname = portalNavigation.path.pathname;

          // Skip if context already in URL
          if (currentPathname.includes(contextId)) return;

          this._log(`App switch — carrying [${contextId}] to [${targetPathname}].`);

          portalNavigation.navigate(
            {
              ...portalNavigation.path,
              pathname: targetPathname,
            },
            { replace: true },
          );

          this._trackEvent('context-navigation.app-switch', {
            appKey: newAppKey,
            mode: 'path',
            contextId,
            pathname: targetPathname,
          });
        }),
    );
  }

  // ── Subscription 3: Context URL guard ──────────────────────────────
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
    const { app: appModule, context: portalContext, navigation: portalNavigation } = this._args;

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
            const contextId = portalContext.currentContext?.id;
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
              newContext: portalContext.currentContext,
              activeContextProvider: snapshot.activeContextProvider,
              hasAppContextProvider: snapshot.hasAppContextProvider,
              portalPathname: currentPathname,
              portalSearch: currentSearch,
            });

            if (!instruction) return;

            snapshot.executor.execute(portalContext.currentContext, instruction);

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
