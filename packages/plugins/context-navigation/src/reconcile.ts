import type { IEventModuleProvider } from '@equinor/fusion-framework-module-event';
import type { INavigationProvider } from '@equinor/fusion-framework-module-navigation';

import type {
  ContextNavigationAdapterResolvedDetail,
  ContextNavigationConfig,
  ContextNavigationSkippedDetail,
} from './types';
import type { ContextNavigationEventSource } from './plugin';
import type { ReconcilerSourceEntry } from './sources/types';
import { getCurrentURL, normalizePath, resolveAdapter, stripQueryParams } from './helpers';
import { applyNavigation, type ApplyNavigationDeps } from './apply-navigation';

/** Dependencies required by {@link reconcile}. */
export interface ReconcileDeps extends ApplyNavigationDeps {
  event: IEventModuleProvider;
  navigation: INavigationProvider;
  config: ContextNavigationConfig;
  eventSource: ContextNavigationEventSource;
}

/**
 * Options that describe the trigger context for a reconciliation pass.
 */
export interface ReconcileOptions {
  /**
   * Whether this reconciliation was triggered by an app switch.
   *
   * When `true`, all query parameters are stripped from the current URL
   * before the adapter encodes the new URL. The adapter adds back whatever
   * it needs (e.g. `$contextId` for query-strategy apps).
   *
   * @default false
   */
  isAppSwitch?: boolean;
}

/**
 * Reconcile a source entry: resolve an adapter and apply navigation
 * for the given app/context combination.
 *
 * Handles three context states:
 * - `undefined` — context not yet resolved, skip.
 * - `null` — context cleared, navigate to `nullContextUrl` if configured.
 * - `ContextItem` — active context, encode via adapter and navigate.
 *
 * @param entry - The reconciler source entry with app key, modules, and context state.
 * @param deps - Shared plugin dependencies.
 * @param options - Optional trigger context (e.g. whether this is an app switch).
 */
export function reconcile(
  entry: ReconcilerSourceEntry,
  deps: ReconcileDeps,
  options: ReconcileOptions = {},
): void {
  const { appKey, appModules, contextState, routingStrategy } = entry;

  const { event, navigation, config, eventSource, ownNavTokens, log } = deps;

  if (contextState === undefined) {
    event.dispatchEvent('onContextNavigationSkipped', {
      detail: { appKey, reason: 'no-context' } as ContextNavigationSkippedDetail,
      source: eventSource,
    });
    log(`Context undefined for [${appKey}] — idle, waiting.`);
    return;
  }

  if (contextState === null && config.nullContextUrl) {
    const currentURL = getCurrentURL(navigation, config.origin);
    const targetPath = config.nullContextUrl({ appKey, currentURL });
    const targetURL = new URL(targetPath, config.origin);

    if (normalizePath(targetURL) !== normalizePath(currentURL)) {
      ownNavTokens.add(normalizePath(targetURL));
      navigation.navigate(targetURL, config.navigationOptions);
      log(`Null context → navigated to [${targetPath}] for [${appKey}]`);
    }
    return;
  }

  const appContext = appModules.context;
  if (!appContext) return;

  const currentURL = getCurrentURL(navigation, config.origin);

  // On app switch, strip all query params so nothing leaks from the
  // previous app. The adapter will add back what it needs.
  if (options.isAppSwitch) {
    stripQueryParams(currentURL);
    log(`App switch detected → stripped query params for [${appKey}]`);
  }

  // When switching apps, always replace the history entry rather than pushing.
  // The portal already pushed a new entry for the app navigation; adding another
  // push here would create a double entry that traps the user when pressing Back.
  // `config.navigationOptions.replace` only applies to in-app context changes.
  const navOptionsOverride = options.isAppSwitch ? { replace: true } : undefined;

  const adapter = resolveAdapter(
    { appKey, appContext, routingStrategy, currentURL },
    config.adapters,
  );

  if (!adapter) {
    event.dispatchEvent('onContextNavigationSkipped', {
      detail: { appKey, reason: 'no-adapter' } as ContextNavigationSkippedDetail,
      source: eventSource,
    });
    log(`No adapter matched for [${appKey}] — skipping.`);
    return;
  }

  event.dispatchEvent('onContextNavigationAdapterResolved', {
    detail: { appKey, adapterId: adapter.id } as ContextNavigationAdapterResolvedDetail,
    source: eventSource,
  });
  log(`Resolved adapter [${adapter.id}] for [${appKey}]`);

  applyNavigation({ appKey, appModules, adapter, context: contextState, currentURL }, deps, navOptionsOverride);
}
