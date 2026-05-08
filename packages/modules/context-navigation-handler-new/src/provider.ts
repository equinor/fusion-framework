import { Subscription, switchMap, EMPTY, of } from 'rxjs';

import type { AppModuleProvider, AppModulesInstance } from '@equinor/fusion-framework-module-app';
import type {
  ContextModule,
  ContextItem,
  IContextProvider,
} from '@equinor/fusion-framework-module-context';
import type { INavigationProvider } from '@equinor/fusion-framework-module-navigation';
import type { IEventModuleProvider } from '@equinor/fusion-framework-module-event';

import type {
  ContextNavigationHandlerConfig,
  ContextNavigationAdapter,
  ContextState,
  ReconcilerPhase,
  AdapterResolutionContext,
  ContextNavigationHandlerNavigateDetail,
  ContextNavigationHandlerNavigatedDetail,
  ContextNavigationHandlerAdapterResolvedDetail,
  ContextNavigationHandlerSkippedDetail,
} from './types';

import { createBoundCustomAdapter } from './adapters/custom-adapter';

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
 * Iterates registered adapters by priority, uses the first whose
 * `canHandle()` returns `true`, then delegates encode/decode to it.
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
  /** Last path (pathname + search) we navigated to — used by URL guard to ignore our own navigations. */
  #lastNavigatedPath: string | null = null;

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
    const source$ = args.config.sourceFactory({
      app: args.app,
      context: args.context,
      navigation: args.navigation,
    });

    this.#subscription.add(
      source$.subscribe(({ appKey, appModules, contextState }) => {
        this.#reconcile(appKey, appModules, contextState);
      }),
    );
  }

  // ── URL Guard (watches URL changes) ────────────────────────────────

  #setupUrlGuard(args: ContextNavigationHandlerProviderArgs): void {
    const { app, navigation } = args;

    const source$ = app.current$.pipe(
      switchMap((currentApp) => {
        if (!currentApp) {
          return EMPTY;
        }
        return currentApp.instance$.pipe(
          switchMap((appModules) => {
            if (!appModules) {
              return EMPTY;
            }
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
        if (!appContext) {
          return;
        }

        const activeContext = appContext.currentContext;
        if (!activeContext) {
          return;
        }

        const currentURL = this.#getCurrentURL();

        // Don't guard if the URL has moved to a different app
        if (!currentURL.pathname.startsWith(`/apps/${appKey}`)) {
          return;
        }

        // Skip if this URL was set by us (avoid re-entrant loop)
        if (this.#isOwnNavigation(currentURL)) {
          return;
        }

        const adapter = this.#resolveAdapter(appKey, appContext, currentURL);
        if (!adapter) {
          return;
        }

        const urlContextId = adapter.decode(currentURL);

        // If URL already has the right context, nothing to do
        if (urlContextId === activeContext.id) {
          return;
        }

        this.#log(`URL guard: context missing from URL, re-applying for [${appKey}]`);
        this.#applyNavigation(appKey, adapter, activeContext, currentURL);
      }),
    );
  }

  // ── Core Reconciliation Logic ──────────────────────────────────────

  #reconcile(
    appKey: string,
    appModules: AppModulesInstance<[ContextModule]>,
    contextState: ContextState,
  ): void {
    // Phase: undefined → idle (still initializing)
    if (contextState === undefined) {
      this.#phase = 'idle';
      this.#dispatchSkipped(appKey, 'no-context');
      this.#log(`Context undefined for [${appKey}] — idle, waiting.`);
      return;
    }

    // Phase: null → cleared
    if (contextState === null) {
      this.#phase = 'cleared';

      // Portal-level null-context override — bypass adapter entirely
      if (this.#config.nullContextUrl) {
        const currentURL = this.#getCurrentURL();
        const targetURL = new URL(this.#config.nullContextUrl, this.#config.origin);

        if (this.#normalizePath(targetURL) !== this.#normalizePath(currentURL)) {
          this.#lastNavigatedPath = this.#normalizePath(targetURL);
          this.#navigation.navigate(targetURL, { replace: true });
          this.#log(`Null context → navigated to [${this.#config.nullContextUrl}] for [${appKey}]`);
        }

        return;
      }
    } else {
      this.#phase = 'active';
    }

    const appContext = appModules.context;
    if (!appContext) {
      return;
    }

    const currentURL = this.#getCurrentURL();
    const adapter = this.#resolveAdapter(appKey, appContext, currentURL);

    if (!adapter) {
      this.#dispatchSkipped(appKey, 'no-adapter');
      this.#log(`No adapter matched for [${appKey}] — skipping.`);
      return;
    }

    this.#applyNavigation(appKey, adapter, contextState, currentURL);
  }

  // ── Apply Navigation ───────────────────────────────────────────────

  #applyNavigation(
    appKey: string,
    adapter: ContextNavigationAdapter,
    context: ContextItem | null,
    currentURL: URL,
  ): void {
    const targetURL = adapter.encode(context, currentURL);

    if (!targetURL) {
      this.#dispatchSkipped(appKey, 'encode-returned-null');
      this.#log(`Adapter [${adapter.id}] returned null for [${appKey}] — skipping.`);
      return;
    }

    // Loop guard: skip if URL already matches
    if (this.#normalizePath(targetURL) === this.#normalizePath(currentURL)) {
      this.#dispatchSkipped(appKey, 'url-matches');
      this.#log(`URL already correct for [${appKey}] — skipping.`);
      return;
    }

    // Dispatch cancelable "navigate" event
    const navigateDetail: ContextNavigationHandlerNavigateDetail = {
      appKey,
      adapterId: adapter.id,
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

        // Perform navigation — track path so URL guard ignores our own navigations
        this.#lastNavigatedPath = this.#normalizePath(targetURL);
        this.#navigation.navigate(targetURL, { replace: true });

        // Dispatch "navigated" event
        const navigatedDetail: ContextNavigationHandlerNavigatedDetail = {
          appKey,
          adapterId: adapter.id,
          targetURL,
          context,
        };

        this.#event.dispatchEvent('onContextNavigationHandlerNavigated', {
          detail: navigatedDetail,
          source: this,
        });

        this.#config.onTransition?.(navigatedDetail);

        this.#log(
          `Navigated [${appKey}]: ${currentURL.pathname}${currentURL.search} → ${targetURL.pathname}${targetURL.search}`,
        );
      });
  }

  // ── Adapter Resolution ─────────────────────────────────────────────

  #resolveAdapter(
    appKey: string,
    appContext: IContextProvider,
    currentURL: URL,
  ): ContextNavigationAdapter | null {
    const resolutionCtx: AdapterResolutionContext = { appKey, appContext, currentURL };

    for (const adapter of this.#config.adapters) {
      if (adapter.canHandle(resolutionCtx)) {
        // Custom adapter needs binding to the specific app's generators
        if (adapter.id === 'custom') {
          const bound = createBoundCustomAdapter(appContext, appKey);
          this.#dispatchAdapterResolved(appKey, bound.id);
          this.#log(`Resolved adapter [${bound.id}] for [${appKey}]`);
          return bound;
        }

        this.#dispatchAdapterResolved(appKey, adapter.id);
        this.#log(`Resolved adapter [${adapter.id}] for [${appKey}]`);
        return adapter;
      }
    }

    return null;
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

  #dispatchAdapterResolved(appKey: string, adapterId: string): void {
    const detail: ContextNavigationHandlerAdapterResolvedDetail = { appKey, adapterId };
    this.#event.dispatchEvent('onContextNavigationHandlerAdapterResolved', {
      detail,
      source: this,
    });
  }

  /** Normalize a URL to a comparable path string (pathname + search, no trailing slash). */
  #normalizePath(url: URL): string {
    const pathname = url.pathname.replace(/\/$/, '') || '/';
    return `${pathname}${url.search}`;
  }

  /** Check if the given URL was the last one we navigated to (re-entrant guard). */
  #isOwnNavigation(url: URL): boolean {
    return this.#lastNavigatedPath !== null && this.#normalizePath(url) === this.#lastNavigatedPath;
  }
}
