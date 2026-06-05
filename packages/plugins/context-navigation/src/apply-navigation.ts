import type { AppModulesInstance } from '@equinor/fusion-framework-module-app';
import type { ContextItem, ContextModule } from '@equinor/fusion-framework-module-context';
import type { IEventModuleProvider } from '@equinor/fusion-framework-module-event';
import type { INavigationProvider } from '@equinor/fusion-framework-module-navigation';

import type { ContextNavigationAdapter } from './adapters/types';
import type {
  ContextNavigationConfig,
  ContextNavigationNavigateDetail,
  ContextNavigationNavigatedDetail,
  ContextNavigationSkippedDetail,
} from './types';
import type { ContextNavigationEventSource } from './plugin';
import { normalizePath } from './helpers';

/**
 * Set of normalized paths that the plugin itself has navigated to.
 *
 * The guard checks incoming navigations against this set and consumes
 * (deletes) the matching token so a future back/forward to the same
 * URL is not silently skipped. Using a Set handles concurrent writes
 * without one overwriting another.
 */
export type OwnNavigationTokens = Set<string>;

/**
 * Dependencies injected into {@link applyNavigation}.
 *
 * These are shared across the plugin's reconciler and guard handlers so that
 * navigation, event dispatch, and token tracking behave consistently regardless
 * of which call-site triggers a navigation.
 */
export interface ApplyNavigationDeps {
  /** Event bus for dispatching cancelable lifecycle events to external listeners. */
  event: IEventModuleProvider;
  /** Navigation provider used to perform the actual URL transition. */
  navigation: INavigationProvider;
  /** Resolved plugin configuration (navigation options, adapters, callbacks). */
  config: ContextNavigationConfig;
  /** Event source token attached to every dispatched event for traceability. */
  eventSource: ContextNavigationEventSource;
  /**
   * Set of own-navigation tokens.
   * Written here after a successful navigation so the URL guard can
   * distinguish plugin-initiated navigations from user-initiated ones.
   */
  ownNavTokens: OwnNavigationTokens;
  /** Conditional debug logger scoped to this plugin instance. */
  log: (msg: string) => void;
}

/**
 * Payload describing the navigation that {@link applyNavigation} should attempt.
 *
 * Carries all the resolved information needed to encode a new URL and navigate:
 * the target app, its modules, the selected adapter, the active context, and
 * the URL to compare against.
 */
export interface ApplyNavigationPayload {
  /** The app key identifying which application this navigation targets. */
  appKey: string;
  /** The app's resolved module instances (needed for event detail payloads). */
  appModules: AppModulesInstance<[ContextModule]>;
  /** The adapter that will encode and decode context into/from the URL. */
  adapter: ContextNavigationAdapter;
  /** The context to encode into the URL, or `null` if context was cleared. */
  context: ContextItem | null;
  /** The current browser URL used as the baseline for comparison. */
  currentURL: URL;
}

/**
 * Apply a context-driven navigation if the adapter produces a different URL.
 *
 * This is the single codepath through which all plugin-initiated navigations flow.
 * It performs four steps in sequence:
 *
 * 1. **Encode** — asks the adapter to produce a target URL from the active context.
 * 2. **Compare** — skips if the target matches the current URL (no-op guard).
 * 3. **Dispatch** — fires a cancelable `onContextNavigationNavigate` event so
 *    external listeners can veto or observe the transition.
 * 4. **Navigate** — performs the actual URL transition and records an own-nav token
 *    so the URL guard knows to ignore the resulting navigation state change.
 *
 * @param payload - The navigation target details (app, adapter, context, URL).
 * @param deps - Shared plugin dependencies (event bus, navigation provider, config).
 * @returns A promise that resolves after the navigation completes or is skipped.
 */
export function applyNavigation(
  payload: ApplyNavigationPayload,
  deps: ApplyNavigationDeps,
): Promise<void> {
  const { appKey, appModules, adapter, context, currentURL } = payload;
  const { event, navigation, config, eventSource, ownNavTokens, log } = deps;

  // Step 1: Ask the adapter to produce the target URL for the given context.
  // A null return means the adapter intentionally declines to navigate (e.g.
  // context type not supported by this adapter's URL scheme).
  const targetURL = adapter.encode({ context, currentURL });

  if (!targetURL) {
    event.dispatchEvent('onContextNavigationSkipped', {
      detail: { appKey, reason: 'encode-returned-null' } as ContextNavigationSkippedDetail,
      source: eventSource,
    });
    log(`Adapter [${adapter.id}] returned null for [${appKey}] — skipping.`);
    return Promise.resolve();
  }

  // Step 2: Compare normalized paths to avoid redundant navigations.
  // This prevents a replace() call when the URL is already correct, which
  // would otherwise create a spurious history entry in some browsers.
  if (normalizePath(targetURL) === normalizePath(currentURL)) {
    event.dispatchEvent('onContextNavigationSkipped', {
      detail: { appKey, reason: 'url-matches' } as ContextNavigationSkippedDetail,
      source: eventSource,
    });
    log(`URL already correct for [${appKey}] — skipping.`);
    return Promise.resolve();
  }

  // Step 3: Dispatch a cancelable event so external code can inspect or veto.
  const navigateDetail: ContextNavigationNavigateDetail = {
    appKey,
    adapterId: adapter.id,
    targetURL,
    sourceURL: currentURL,
    context,
    appModules,
  };

  return event
    .dispatchEvent('onContextNavigationNavigate', {
      detail: navigateDetail,
      source: eventSource,
      cancelable: true,
    })
    .then((ev) => {
      // If any listener called event.preventDefault(), abort navigation.
      if (ev.canceled) {
        event.dispatchEvent('onContextNavigationSkipped', {
          detail: { appKey, reason: 'canceled' } as ContextNavigationSkippedDetail,
          source: eventSource,
        });
        log(`Navigation canceled for [${appKey}].`);
        return;
      }

      // Step 4: Record the token BEFORE navigating so the guard sees it
      // on the resulting state$ emission and skips re-processing.
      ownNavTokens.add(normalizePath(targetURL));
      navigation.navigate(targetURL, config.navigationOptions);

      // Post-navigation bookkeeping: notify listeners and invoke callback.
      const navigatedDetail: ContextNavigationNavigatedDetail = {
        appKey,
        adapterId: adapter.id,
        targetURL,
        context,
        appModules,
      };

      event.dispatchEvent('onContextNavigationNavigated', {
        detail: navigatedDetail,
        source: eventSource,
      });

      config.onTransition?.(navigatedDetail);
      log(
        `Navigated [${appKey}]: ${currentURL.pathname}${currentURL.search} → ${targetURL.pathname}${targetURL.search}`,
      );
    })
    .catch((err: unknown) => {
      // Swallow dispatch/navigation errors to avoid unhandled rejections.
      // Logging ensures failures are observable during development.
      log(`Navigation dispatch failed for [${appKey}]: ${String(err)}`);
    });
}
