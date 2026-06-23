import { applyNavigation } from '../apply-navigation';
import { resolveAdapter } from '../helpers';

import type { GuardTickPayload } from './guard-tick-payload';
import type { GuardTickDeps } from './guard-tick-deps';

/**
 * Handle a URL guard tick in **replace mode** (`navigationOptions.replace: true`, the default).
 *
 * Intent: correct URL drift caused by external interference.
 *
 * In replace mode, context changes replace the current history entry, so there is
 * no meaningful back/forward stack within the context history. A URL mismatch
 * therefore means something external mutated the URL (a redirect, a router
 * guard stripping segments, etc.). The fix is to re-assert the active context
 * back into the URL, restoring the canonical app path.
 *
 * @param payload - The active app key and resolved modules.
 * @param currentURL - The current browser URL that diverged from the active context.
 * @param deps - Shared plugin dependencies.
 */
export function handleReplaceModeGuard(
  payload: GuardTickPayload,
  currentURL: URL,
  deps: GuardTickDeps,
): void {
  const { appKey, appModules, routingStrategy } = payload;
  const { log } = deps;

  // Resolve the active context and adapter for re-encoding.
  const activeContext = appModules.context.currentContext;
  // No active context to re-encode — nothing to correct.
  if (!activeContext) return;
  const adapter = resolveAdapter(
    { appKey, appContext: appModules.context, routingStrategy, currentURL },
    deps.config.adapters,
  );
  // No adapter matched — plugin is not responsible for this app's URL shape.
  if (!adapter) return;

  log(`URL guard: context missing from URL, re-applying for [${appKey}]`);
  // Always replace when correcting URL drift. The URL has no context segment
  // (e.g. a bare app route the portal pushed), so we fix it in-place. Using
  // push here would create an extra history entry that traps Back navigation.
  applyNavigation({ appKey, appModules, adapter, context: activeContext, currentURL }, deps, {
    replace: true,
  });
}
