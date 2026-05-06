import { Subscription, switchMap, EMPTY, of, combineLatestWith, distinctUntilChanged } from 'rxjs';

import type { AppModuleProvider, AppModulesInstance } from '@equinor/fusion-framework-module-app';
import type {
  ContextModule,
  ContextItem,
  IContextProvider,
} from '@equinor/fusion-framework-module-context';
import type { INavigationProvider } from '@equinor/fusion-framework-module-navigation';
import type {
  IEventModuleProvider,
  FrameworkEvent,
  FrameworkEventInit,
} from '@equinor/fusion-framework-module-event';

import type {
  ContextNavigationHandlerConfig,
  ContextRoutingStrategy,
  ContextState,
  ReconcilerPhase,
  RoutingStrategyId,
  ContextNavigationHandlerNavigateDetail,
  ContextNavigationHandlerNavigatedDetail,
  ContextNavigationHandlerStrategyResolvedDetail,
  ContextNavigationHandlerSkippedDetail,
} from './types';

import { pathStrategy } from './strategies/path-strategy';
import { createCustomStrategyFromProvider } from './strategies/custom-strategy';

// ─── Provider Args ──────────────────────────────────────────────────

export interface ContextNavigationHandlerProviderArgs {
  app: AppModuleProvider;
  navigation: INavigationProvider;
  context: IContextProvider;
  event: IEventModuleProvider;
  config: ContextNavigationHandlerConfig;
}

// ─── Provider ───────────────────────────────────────────────────────

/**
 * Event-driven context-to-URL reconciler.
 *
 * Single reconciliation loop: on every relevant event, compare
 * desired context vs what's currently in the URL. If they differ,
 * encode and navigate.
 *
 * All navigation intent is communicated via the framework event module,
 * making the system observable and cancelable.
 */
export class ContextNavigationHandlerProvider {
  readonly #subscription = new Subscription();
  readonly #config: ContextNavigationHandlerConfig;
  readonly #event: IEventModuleProvider;
  readonly #navigation: INavigationProvider;

  #phase: ReconcilerPhase = 'idle';
  /** Last pathname we navigated to — used by URL guard to ignore our own navigations. */
  #lastNavigatedPathname: string | null = null;

  constructor(args: ContextNavigationHandlerProviderArgs) {
    this.#config = args.config;
    this.#event = args.event;
    this.#navigation = args.navigation;

    this.#setupReconciler(args);

    if (args.config.enableUrlGuard) {
      this.#setupUrlGuard(args);
    }
  }

  get phase(): ReconcilerPhase {
    return this.#phase;
  }

  dispose(): void {
    this.#subscription.unsubscribe();
  }

  // ── Reconciler (single subscription) ────────────────────────────────

  #setupReconciler(args: ContextNavigationHandlerProviderArgs): void {
    const { app, context, navigation } = args;

    // Source: app switches + context changes → unified emission
    const source$ = app.current$.pipe(
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
      combineLatestWith(
        context.currentContext$.pipe(
          distinctUntilChanged((a, b) => {
            if (a && b) return a.id === b.id;
            return a === b;
          }),
        ),
      ),
    );

    this.#subscription.add(
      source$.subscribe(([{ appModules, appKey }, contextState]) => {
        this.#reconcile(appKey, appModules, contextState);
      }),
    );
  }

  // ── URL Guard (watches URL changes) ────────────────────────────────

  #setupUrlGuard(args: ContextNavigationHandlerProviderArgs): void {
    const { app, navigation } = args;

    const source$ = app.current$.pipe(
      switchMap((currentApp) => {
        if (!currentApp) return EMPTY;
        return currentApp.instance$.pipe(
          switchMap((appModules) => {
            if (!appModules) return EMPTY;
            return navigation.state$.pipe(
              switchMap(() =>
                of({
                  appModules: appModules as AppModulesInstance<[ContextModule]>,
                  appKey: currentApp.appKey,
                }),
              ),
            );
          }),
        );
      }),
    );

    this.#subscription.add(
      source$.subscribe(({ appModules, appKey }) => {
        const appContext = appModules.context;
        if (!appContext) return;

        const activeContext = appContext.currentContext;
        if (!activeContext) return;

        const currentURL = this.#getCurrentURL();

        // Don't guard if the URL has moved to a different app (app switch in progress)
        if (!currentURL.pathname.startsWith(`/apps/${appKey}`)) return;

        const strategy = this.#resolveStrategy(appKey, appModules);
        if (!strategy) return;

        // Skip if this URL was set by us (avoid re-entrant loop, normalize trailing slash)
        const normPathname = currentURL.pathname.replace(/\/$/, '') || '/';
        const normLastNav = this.#lastNavigatedPathname?.replace(/\/$/, '') || null;
        if (normPathname === normLastNav) return;

        const urlContextId = strategy.decode(currentURL);

        // If URL already has the right context, nothing to do
        if (urlContextId === activeContext.id) return;

        // Re-apply context via reconciliation
        this.#log(`URL guard: context missing from URL, re-applying for [${appKey}]`);
        this.#applyNavigation(appKey, strategy, activeContext, currentURL);
      }),
    );
  }

  // ── Core Reconciliation Logic ──────────────────────────────────────

  #reconcile(
    appKey: string,
    appModules: AppModulesInstance<[ContextModule]>,
    contextState: ContextState,
  ): void {
    // Phase: undefined → idle (waiting)
    if (contextState === undefined) {
      this.#phase = 'idle';
      this.#dispatchSkipped(appKey, 'no-context');
      this.#log(`Context undefined for [${appKey}] — idle, waiting.`);
      return;
    }

    // Phase: null → cleared
    if (contextState === null) {
      this.#phase = 'cleared';
    } else {
      this.#phase = 'active';
    }

    // Validate: does this app support the current context?
    // If the app's context provider rejects it, don't encode it into the URL.
    if (contextState !== null) {
      const appContext = appModules.context;
      if (appContext?.validateContext && !appContext.validateContext(contextState)) {
        this.#dispatchSkipped(appKey, 'context-not-supported');
        this.#log(
          `Context [${contextState.id}] not supported by app [${appKey}] — skipping navigation.`,
        );
        return;
      }
    }

    const strategy = this.#resolveStrategy(appKey, appModules);
    if (!strategy) {
      this.#log(`No strategy resolved for [${appKey}] — skipping.`);
      return;
    }

    const currentURL = this.#getCurrentURL();
    this.#applyNavigation(appKey, strategy, contextState, currentURL);
  }

  #applyNavigation(
    appKey: string,
    strategy: ContextRoutingStrategy,
    context: ContextItem | null,
    currentURL: URL,
  ): void {
    const targetURL = strategy.encode(context, currentURL);

    if (!targetURL) {
      this.#dispatchSkipped(appKey, 'encode-returned-null');
      this.#log(`Strategy [${strategy.id}] returned null for [${appKey}] — skipping.`);
      return;
    }

    // Loop guard: skip if URL already matches (normalize trailing slashes)
    const normTarget = targetURL.pathname.replace(/\/$/, '') || '/';
    const normCurrent = currentURL.pathname.replace(/\/$/, '') || '/';
    if (normTarget === normCurrent && targetURL.search === currentURL.search) {
      this.#dispatchSkipped(appKey, 'url-matches');
      this.#log(`URL already correct for [${appKey}] — skipping.`);
      return;
    }

    // Dispatch cancelable "navigate" event
    const navigateDetail: ContextNavigationHandlerNavigateDetail = {
      appKey,
      strategy: strategy.id,
      targetURL,
      sourceURL: currentURL,
      context,
    };

    this.#event
      .dispatchEvent('onContextNavigationHandlerNavigate', {
        detail: navigateDetail,
        source: this,
        cancelable: true,
      })
      .then((event) => {
        if (event.canceled) {
          this.#dispatchSkipped(appKey, 'canceled');
          this.#log(`Navigation canceled by listener for [${appKey}].`);
          return;
        }

        // Perform navigation — track pathname so URL guard ignores our own navigations
        this.#lastNavigatedPathname = targetURL.pathname;
        this.#navigation.navigate(targetURL, { replace: true });

        // Dispatch "navigated" event
        const navigatedDetail: ContextNavigationHandlerNavigatedDetail = {
          appKey,
          strategy: strategy.id,
          targetURL,
          context,
        };

        this.#event.dispatchEvent('onContextNavigationHandlerNavigated', {
          detail: navigatedDetail,
          source: this,
        });

        // Call onTransition hook if configured
        this.#config.onTransition?.(navigatedDetail);

        this.#log(
          `Navigated [${appKey}]: ${currentURL.pathname}${currentURL.search} → ${targetURL.pathname}${targetURL.search}`,
        );
      });
  }

  // ── Strategy Resolution ────────────────────────────────────────────

  #resolveStrategy(
    appKey: string,
    appModules: AppModulesInstance<[ContextModule]>,
  ): ContextRoutingStrategy | null {
    const appContext = appModules.context;
    const declaredStrategy = appContext?.routingStrategy;

    let strategyId: RoutingStrategyId;

    if (declaredStrategy === 'custom') {
      // Custom requires app to provide encode/decode hooks
      const custom = appContext ? createCustomStrategyFromProvider(appContext, appKey) : null;
      if (custom) {
        this.#dispatchStrategyResolved(appKey, 'custom');
        return custom;
      }
      // Fallback to path if hooks are missing
      strategyId = 'path';
      this.#log(`App [${appKey}] declared custom but lacks hooks — falling back to path.`);
    } else if (declaredStrategy === 'query') {
      strategyId = 'query';
    } else if (declaredStrategy === 'path') {
      strategyId = 'path';
    } else {
      // undefined strategy — legacy apps: check if app has generators → use custom
      const custom = appContext ? createCustomStrategyFromProvider(appContext, appKey) : null;
      if (custom) {
        this.#log(`App [${appKey}] has no declared strategy but has generators — using custom.`);
        this.#dispatchStrategyResolved(appKey, 'custom');
        return custom;
      }
      strategyId = 'path';
    }

    const strategy = this.#config.strategies[strategyId];
    this.#dispatchStrategyResolved(appKey, strategyId);
    return strategy ?? null;
  }

  // ── Helpers ────────────────────────────────────────────────────────

  #getCurrentURL(): URL {
    const nav = this.#navigation;
    return new URL(`${nav.path.pathname}${nav.path.search ?? ''}`, this.#config.origin);
  }

  #log(message: string): void {
    if (this.#config.debug) {
      console.debug(`[${this.#config.portalName}] ContextNavigationHandler: ${message}`);
    }
  }

  #dispatchSkipped(appKey: string, reason: ContextNavigationHandlerSkippedDetail['reason']): void {
    this.#event.dispatchEvent('onContextNavigationHandlerSkipped', {
      detail: { appKey, reason },
      source: this,
    });
  }

  #dispatchStrategyResolved(appKey: string, strategy: RoutingStrategyId): void {
    this.#event.dispatchEvent('onContextNavigationHandlerStrategyResolved', {
      detail: { appKey, strategy },
      source: this,
    });
  }
}
