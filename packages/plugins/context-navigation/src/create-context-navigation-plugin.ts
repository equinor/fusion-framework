import { Subscription, startWith, pairwise, map } from 'rxjs';

import type { AppModuleProvider } from '@equinor/fusion-framework-module-app';
import type { IContextProvider } from '@equinor/fusion-framework-module-context';
import type { IEventModuleProvider } from '@equinor/fusion-framework-module-event';
import type { INavigationProvider } from '@equinor/fusion-framework-module-navigation';

import type { ContextNavigationConfig } from './types.js';
import { getCurrentURL, normalizePathFromURL, resolveAdapter } from './helpers/index.js';
import type { OwnNavigationTokens } from './apply-navigation.js';
import { activeAppNavigationEvents } from './operators/active-app-navigation-events.js';
import {
  consumeOwnNavToken,
  handlePushModeGuard,
  handleReplaceModeGuard,
  isInAppScope,
  urlIdentifiesContext,
  type GuardTickDeps,
} from './guard-handlers/index.js';
import { reconcile } from './reconcile.js';
import { version } from './version.js';

/**
 * Arguments required to initialize the context-navigation plugin.
 *
 * Consumers never construct this directly — it is assembled by the framework's
 * plugin registration callback from the initialized module providers.
 */
export interface ContextNavigationPluginArgs {
  /** Provides the currently active app and its resolved module instances. */
  app: AppModuleProvider;
  /** Provides browser navigation state and imperative navigation methods. */
  navigation: INavigationProvider;
  /** Provides the active context and mutation methods (e.g. setCurrentContextByIdAsync). */
  context: IContextProvider;
  /** Provides the cancelable event bus for dispatching plugin lifecycle events. */
  event: IEventModuleProvider;
  /** Fully resolved plugin configuration (adapters, sources, options). */
  config: ContextNavigationConfig;
}

/** Event source token forwarded to all dispatched events. */
const eventSource = { name: 'contextNavigation', version };

/** The type of the event source token attached to all context-navigation events. */
export type ContextNavigationEventSource = typeof eventSource;

// ── Plugin factory ────────────────────────────────────────────────────

/**
 * Creates the context-navigation plugin runtime.
 *
 * Sets up two subscriptions:
 *
 * **Reconciler** — watches the portal context and app switches via the configured
 * source factory. On each emission it encodes the active context into the app URL
 * using the first matching adapter.
 *
 * **URL guard** — watches browser navigation state and detects when the URL no
 * longer reflects the active context. If the adapter reports `appOwnsUrl`, the URL is
 * the source of truth: routes without context are left alone and a context found in the
 * URL is applied. Otherwise behavior depends on `navigationOptions.replace`:
 *
 * - `replace: true` (default) — each context change replaces the current history entry,
 *   so there is no meaningful back/forward stack within the context history. If the URL
 *   diverges from the active context (e.g. an external redirect stripped the context
 *   segment), the guard re-asserts the active context into the URL.
 *
 * - `replace: false` (push mode) — each context change pushes a new history entry, so
 *   back/forward navigations legitimately land on URLs with different context IDs. The
 *   guard detects this and drives context from the URL instead of overwriting it,
 *   keeping the browser history and context state in sync.
 *
 * @param args - Initialized module providers and resolved plugin config.
 * @returns A teardown function compatible with {@link FrameworkPluginTeardown}.
 */
export function createContextNavigationPlugin(args: ContextNavigationPluginArgs): () => void {
  const { app, navigation, context, event, config } = args;

  // Aggregate subscription — all plugin-owned subscriptions are collected here
  // so the teardown function can unsubscribe from everything in one call.
  const subscriptions = new Subscription();

  // Token set used to distinguish plugin-initiated navigations from user-initiated ones.
  // The guard reads and consumes tokens; the reconciler and applyNavigation write them.
  const ownNavTokens: OwnNavigationTokens = new Set();

  // Conditional debug logger scoped to this plugin instance.
  const log = (msg: string): void => {
    // Only log debug messages if debug mode is enabled in config.
    if (config.debug) {
      console.debug(`[${config.portalName}] ContextNavigation: ${msg}`);
    }
  };

  // Dependency bag shared across reconcile, applyNavigation, and guard handlers.
  // Avoids passing individual arguments and keeps function signatures stable.
  const deps = { event, navigation, config, eventSource, ownNavTokens, log };

  // ── Reconciler subscription ─────────────────────────────────────
  // The source$ observable is created by the configured sourceFactory.
  // It emits whenever the active context or app changes (implementation-specific).
  // Each emission triggers reconcile(), which resolves an adapter and navigates.
  const source$ = config.sourceFactory({ app, context, navigation });

  // Emit [null, firstEntry] on first emission, then [prevEntry, currEntry] thereafter.
  // Map pairs to object with entry and isAppSwitch flag for reconciler.
  subscriptions.add(
    source$
      .pipe(
        startWith(null),
        pairwise(),
        map(([prev, entry]) => ({
          entry: entry as typeof entry & {},
          isAppSwitch: prev != null && prev.appKey !== (entry as typeof entry & {}).appKey,
        })),
      )
      .subscribe(({ entry, isAppSwitch }) => {
        reconcile(entry, deps, { isAppSwitch, requireValidContext: config.requireValidContext });
      }),
  );

  // ── URL guard subscription (optional) ───────────────────────────
  // When enabled, the guard monitors every browser navigation event to detect
  // URL/context drift. It fires after the reconciler has already handled
  // context changes, so its role is corrective, not primary.
  if (config.enableUrlGuard) {
    // Guard needs the context provider to drive context from URL in push mode.
    const guardDeps: GuardTickDeps = { ...deps, context };

    // At most one URL-driven context lookup runs at a time. It belongs to the URL that
    // started it: once the user is somewhere else, its result is stale and must not apply.
    let pendingLookup: { path: string; subscription: Subscription } | undefined;

    const cancelPendingLookup = (): void => {
      pendingLookup?.subscription.unsubscribe();
      pendingLookup = undefined;
    };
    subscriptions.add(cancelPendingLookup);

    const resolveContextFromURL = (
      urlContextId: string,
      payload: Parameters<typeof handlePushModeGuard>[1],
      currentURL: URL,
    ): void => {
      const path = normalizePathFromURL(currentURL);
      // The same URL is already being resolved (repeated navigation event) — don't start again.
      if (pendingLookup?.path === path && !pendingLookup.subscription.closed) {
        return;
      }
      cancelPendingLookup();
      const subscription = handlePushModeGuard(urlContextId, payload, currentURL, guardDeps);
      if (subscription && !subscription.closed) {
        pendingLookup = { path, subscription };
      }
    };

    subscriptions.add(
      // activeAppNavigationEvents$ emits the current app key and modules
      // on every navigation state change, filtering out null/unresolved states.
      activeAppNavigationEvents(app, navigation).subscribe(
        ({ appModules, appKey, routingStrategy }) => {
          const appContext = appModules.context;

          // No context module means nothing to guard — bail early.
          if (!appContext) {
            return;
          }

          const currentURL = getCurrentURL(navigation, config.origin);

          // The user moved on before a URL-driven lookup settled — drop it, so a late
          // success can't change the context and a late failure can't redirect back.
          if (pendingLookup && pendingLookup.path !== normalizePathFromURL(currentURL)) {
            log(`URL guard: navigation left [${pendingLookup.path}] — canceling its lookup.`);
            cancelPendingLookup();
          }

          // Scope check: only guard URLs that belong to this app's path namespace.
          // Navigations to other apps or external paths are not our responsibility.
          if (!isInAppScope(currentURL, appKey)) {
            return;
          }

          // Own-navigation check: if this URL was navigated to by the plugin itself,
          // consume the token and skip — prevents infinite reconcile/guard loops.
          if (consumeOwnNavToken(currentURL, ownNavTokens)) {
            return;
          }

          // Resolve the adapter for this app/URL combination.
          // If no adapter matches, the URL format is unknown — we can't guard it.
          const adapter = resolveAdapter(
            { appKey, appContext, routingStrategy, currentURL },
            config.adapters,
          );

          // No matching adapter means we can't decode the URL — bail out.
          if (!adapter) {
            return;
          }

          const activeContext = appContext.currentContext;
          const urlContextId = adapter.decode(currentURL);
          const appOwnsUrl = adapter.appOwnsUrl === true;
          const payload = { appKey, appModules, routingStrategy };

          // No active context: only an app-owned URL that carries a context needs action
          // (e.g. a link from a page without context) — apply the context from the URL.
          if (!activeContext) {
            if (appOwnsUrl && urlContextId !== null) {
              log(`URL guard: no active context, applying [${urlContextId}] from URL`);
              resolveContextFromURL(urlContextId, payload, currentURL);
            }
            return;
          }

          // If the URL already encodes the active context, state is in sync — done.
          if (urlContextId === activeContext.id) {
            return;
          }

          // The app owns this route and it has no context (e.g. a list page) — not drift.
          if (urlContextId === null && appOwnsUrl) {
            log(`URL guard: [${currentURL.pathname}] has no context — leaving it alone.`);
            return;
          }

          // The URL may identify the active context by key or slug instead of id.
          // In sync only when the adapter itself writes that value for the active context.
          if (
            urlContextId !== null &&
            urlIdentifiesContext({
              adapter,
              appKey,
              context: activeContext,
              urlContextValue: urlContextId,
              currentURL,
            })
          ) {
            return;
          }

          // The URL holds a different context. Drive context FROM the URL when:
          // - push mode: the user navigated via browser back/forward, or
          // - the app owns its URL: the app navigated to another context's route.
          const urlDrivesContext = config.navigationOptions?.replace === false || appOwnsUrl;
          if (urlContextId !== null && urlDrivesContext) {
            resolveContextFromURL(urlContextId, payload, currentURL);
            return;
          }

          // Replace mode (default): URL diverged from active context (external redirect,
          // stripped segment, etc.). Re-assert the active context INTO the URL.
          handleReplaceModeGuard(payload, currentURL, guardDeps);
        },
      ),
    );
  }

  // Return a teardown function that unsubscribes from all plugin subscriptions.
  // Called by the framework when the plugin is disposed (app unmount or hot-reload).
  return () => subscriptions.unsubscribe();
}
