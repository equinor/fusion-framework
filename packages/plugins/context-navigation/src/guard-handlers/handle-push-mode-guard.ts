import { applyNavigation } from '../apply-navigation';
import { resolveAdapter } from '../helpers';

import type { ContextNavigationSkippedDetail } from '../types';
import type { GuardTickPayload } from './guard-tick-payload';
import type { GuardTickDeps } from './guard-tick-deps';

/**
 * Handle a URL guard tick in **push mode** (`navigationOptions.replace: false`).
 *
 * Intent: keep browser history and context state bidirectionally in sync.
 *
 * In push mode, each context change pushes a new history entry, so back/forward
 * navigations legitimately land on URLs with different context IDs. When the guard
 * detects a URL containing a context ID that differs from the active context, it
 * interprets this as the user having navigated through history and drives context
 * FROM the URL (rather than overwriting the URL).
 *
 * If the URL's context ID can't be resolved (stale bookmark, deleted context),
 * the function falls back to re-asserting the active context into the URL so the
 * address bar isn't left pointing at a broken resource.
 *
 * @param urlContextId - The context ID decoded from the current URL by the adapter.
 * @param payload - The active app key and resolved modules.
 * @param currentURL - The current browser URL.
 * @param deps - Shared plugin dependencies including the context provider.
 */
export function handlePushModeGuard(
  urlContextId: string,
  payload: GuardTickPayload,
  currentURL: URL,
  deps: GuardTickDeps,
): void {
  const { appKey, appModules, routingStrategy } = payload;
  const { context, event, eventSource, config, log } = deps;

  // Resolve the active context and adapter — both are required to fall back.
  const activeContext = appModules.context.currentContext;

  // No active context to fall back to — nothing to do.
  if (!activeContext) {
    return;
  }

  const adapter = resolveAdapter(
    { appKey, appContext: appModules.context, routingStrategy, currentURL },
    deps.config.adapters,
  );

  // No adapter matched — plugin is not responsible for this app's URL shape.
  if (!adapter) {
    return;
  }

  log(`URL guard: URL has context [${urlContextId}] for [${appKey}] — setting context from URL`);

  // Attempt to set context from the URL-decoded ID.
  // On failure (e.g. context deleted), fall back to re-encoding the active context.
  context.setCurrentContextByIdAsync(urlContextId).catch(() => {
    // Mirror reconcile's validation gate: an invalid active context must not
    // be re-encoded into the URL as a fallback.
    if (config.requireValidContext && !appModules.context.validateContext(activeContext)) {
      event.dispatchEvent('onContextNavigationSkipped', {
        detail: { appKey, reason: 'invalid-app-context' } as ContextNavigationSkippedDetail,
        source: eventSource,
      });
      log(`URL guard: context invalid for [${appKey}] — skipping fallback re-assert.`);
      return;
    }
    applyNavigation({ appKey, appModules, adapter, context: activeContext, currentURL }, deps);
  });
}
