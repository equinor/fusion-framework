import { switchMap, EMPTY, of } from 'rxjs';

import { BaseModuleProvider } from '@equinor/fusion-framework-module/provider';
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
  ContextNavigationAdapterInput,
  ReconcilerPhase,
  AdapterResolutionContext,
  ReconcilerSourceEntry,
  ContextNavigationHandlerNavigateDetail,
  ContextNavigationHandlerNavigatedDetail,
  ContextNavigationHandlerAdapterResolvedDetail,
  ContextNavigationHandlerSkippedDetail,
} from './types';

import { version } from './version';

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
export class ContextNavigationHandlerProvider extends BaseModuleProvider<ContextNavigationHandlerConfig> {
  readonly #config: ContextNavigationHandlerConfig;
  readonly #event: IEventModuleProvider;
  readonly #navigation: INavigationProvider;

  #phase: ReconcilerPhase = 'idle';
  /** Last path (pathname + search) we navigated to — used by URL guard to ignore our own navigations. */
  #lastNavigatedPath: string | null = null;

  constructor(args: ContextNavigationHandlerProviderArgs) {
    super({ version, config: args.config });
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

  // ── Reconciler (single subscription) ────────────────────────────────

  #setupReconciler(args: ContextNavigationHandlerProviderArgs): void {
    const source$ = args.config.sourceFactory({
      app: args.app,
      context: args.context,
      navigation: args.navigation,
    });

    this._addTeardown(
      source$.subscribe((entry) => {
        this.#reconcile(entry);
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

    this._addTeardown(
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

        const adapter = this.#resolveAdapter({ appKey, appContext, currentURL });
        if (!adapter) {
          return;
        }

        const urlContextId = adapter.decode(currentURL);

        // If URL already has the right context, nothing to do
        if (urlContextId === activeContext.id) {
          return;
        }

        this.#log(`URL guard: context missing from URL, re-applying for [${appKey}]`);
        this.#applyNavigation({ appKey, appModules, adapter, context: activeContext, currentURL });
      }),
    );
  }

  // ── Core Reconciliation Logic ──────────────────────────────────────

  #reconcile({ appKey, appModules, contextState }: ReconcilerSourceEntry): void {
    // Phase: undefined → idle (still initializing)
    if (contextState === undefined) {
      this.#phase = 'idle';
      this.#dispatchSkipped({ appKey, reason: 'no-context' });
      this.#log(`Context undefined for [${appKey}] — idle, waiting.`);
      return;
    }

    // Phase: null → cleared
    if (contextState === null) {
      this.#phase = 'cleared';

      // Portal-level null-context override — bypass adapter entirely
      if (this.#config.nullContextUrl) {
        const currentURL = this.#getCurrentURL();
        const targetPath = this.#config.nullContextUrl({ appKey, currentURL });
        const targetURL = new URL(targetPath, this.#config.origin);

        if (this.#normalizePath(targetURL) !== this.#normalizePath(currentURL)) {
          this.#lastNavigatedPath = this.#normalizePath(targetURL);
          this.#navigation.navigate(targetURL, this.#config.navigationOptions);
          this.#log(`Null context → navigated to [${targetPath}] for [${appKey}]`);
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
    const adapter = this.#resolveAdapter({ appKey, appContext, currentURL });

    if (!adapter) {
      this.#dispatchSkipped({ appKey, reason: 'no-adapter' });
      this.#log(`No adapter matched for [${appKey}] — skipping.`);
      return;
    }

    this.#applyNavigation({ appKey, appModules, adapter, context: contextState, currentURL });
  }

  // ── Apply Navigation ───────────────────────────────────────────────────────

  #applyNavigation(args: {
    appKey: string;
    appModules: AppModulesInstance<[ContextModule]>;
    adapter: ContextNavigationAdapter;
    context: ContextItem | null;
    currentURL: URL;
  }): void {
    const { appKey, appModules, adapter, context, currentURL } = args;
    const targetURL = adapter.encode({ context, currentURL });

    if (!targetURL) {
      this.#dispatchSkipped({ appKey, reason: 'encode-returned-null' });
      this.#log(`Adapter [${adapter.id}] returned null for [${appKey}] — skipping.`);
      return;
    }

    // Loop guard: skip if URL already matches
    if (this.#normalizePath(targetURL) === this.#normalizePath(currentURL)) {
      this.#dispatchSkipped({ appKey, reason: 'url-matches' });
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
      appModules,
    };

    this.#event
      .dispatchEvent('onContextNavigationHandlerNavigate', {
        detail: navigateDetail,
        source: this,
        cancelable: true,
      })
      .then((event) => {
        if (event.canceled) {
          this.#dispatchSkipped({ appKey, reason: 'canceled' });
          this.#log(`Navigation canceled by listener for [${appKey}].`);
          return;
        }

        // Perform navigation — track path so URL guard ignores our own navigations
        this.#lastNavigatedPath = this.#normalizePath(targetURL);
        this.#navigation.navigate(targetURL, this.#config.navigationOptions);

        // Dispatch "navigated" event
        const navigatedDetail: ContextNavigationHandlerNavigatedDetail = {
          appKey,
          adapterId: adapter.id,
          targetURL,
          context,
          appModules,
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

  #resolveAdapter(ctx: AdapterResolutionContext): ContextNavigationAdapter | null {
    for (const entry of this.#config.adapters) {
      const adapter = this.#resolveAdapterEntry(entry, ctx);
      if (adapter) {
        this.#dispatchAdapterResolved({ appKey: ctx.appKey, adapterId: adapter.id });
        this.#log(`Resolved adapter [${adapter.id}] for [${ctx.appKey}]`);
        return adapter;
      }
    }

    return null;
  }

  /**
   * Resolve a single adapter entry — either call the factory or check canHandle.
   */
  #resolveAdapterEntry(
    entry: ContextNavigationAdapterInput,
    ctx: AdapterResolutionContext,
  ): ContextNavigationAdapter | null {
    if (typeof entry === 'function') {
      return entry(ctx);
    }
    if (entry.canHandle(ctx)) {
      return entry;
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

  #dispatchSkipped(detail: ContextNavigationHandlerSkippedDetail): void {
    this.#event.dispatchEvent('onContextNavigationHandlerSkipped', {
      detail,
      source: this,
    });
  }

  #dispatchAdapterResolved(detail: ContextNavigationHandlerAdapterResolvedDetail): void {
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
