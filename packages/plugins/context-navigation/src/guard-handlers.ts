import type { AppModulesInstance } from '@equinor/fusion-framework-module-app';
import type { ContextModule, IContextProvider } from '@equinor/fusion-framework-module-context';

import type { ContextNavigationConfig } from './types';
import type { ApplyNavigationDeps, OwnNavigationTokens } from './apply-navigation';
import { normalizePath, resolveAdapter } from './helpers';
import { applyNavigation } from './apply-navigation';

/**
 * Payload emitted on each URL guard tick, carrying the resolved app identity
 * and its module instances so the guard can inspect app-level context state.
 */
export interface GuardTickPayload {
  /** The currently active app's key (used for URL scope checks). */
  appKey: string;
  /** The app's resolved module instances (provides access to context provider). */
  appModules: AppModulesInstance<[ContextModule]>;
}

/**
 * Dependencies required by the URL guard handler functions.
 *
 * Extends {@link ApplyNavigationDeps} with the context provider needed
 * to drive context from the URL in push mode.
 */
export interface GuardTickDeps extends ApplyNavigationDeps {
  /** Resolved plugin configuration (adapters, navigation options). */
  config: ContextNavigationConfig;
  /** Context provider for setting context from URL-decoded IDs in push mode. */
  context: IContextProvider;
  /** Own-navigation token set (inherited from ApplyNavigationDeps). */
  ownNavTokens: OwnNavigationTokens;
  /** Conditional debug logger. */
  log: (msg: string) => void;
}

/**
 * Determine whether the current URL falls within the active app's path namespace.
 *
 * The plugin must only guard URLs that belong to its own app. Navigations to
 * other apps or external paths should be ignored entirely — they are another
 * app instance's responsibility.
 *
 * Convention: all app URLs live under `/apps/{appKey}` or `/apps/{appKey}/...`.
 *
 * @param currentURL - The current browser URL to check.
 * @param appKey - The app key used to derive the expected base path.
 * @returns `true` if the URL belongs to this app's scope.
 */
export function isInAppScope(currentURL: URL, appKey: string): boolean {
  const appBase = `/apps/${appKey}`;
  // Exact match (app root) or path-segment-prefixed (app sub-route).
  return currentURL.pathname === appBase || currentURL.pathname.startsWith(`${appBase}/`);
}

/**
 * Consume an own-navigation token if the current URL matches one previously
 * navigated to by the plugin itself.
 *
 * Intent: prevent infinite loops between the reconciler and the guard.
 * When the reconciler calls `applyNavigation`, it records the target path as a
 * token. The next `navigation.state$` emission triggers the guard, which would
 * otherwise see a "new" URL and try to reconcile again. By checking and consuming
 * the token here, the guard knows this URL change was self-initiated and bails.
 *
 * Each token is consumed (deleted from the set) exactly once. This ensures that
 * a subsequent user-initiated back/forward navigation to the same path IS
 * processed by the guard, since the token will no longer be present.
 *
 * @param currentURL - The current browser URL to check against known tokens.
 * @param ownNavTokens - The set of normalized paths the plugin has navigated to.
 * @returns `true` if this navigation was plugin-initiated (caller should bail).
 */
export function consumeOwnNavToken(currentURL: URL, ownNavTokens: OwnNavigationTokens): boolean {
  const normalized = normalizePath(currentURL);
  if (ownNavTokens.has(normalized)) {
    ownNavTokens.delete(normalized);
    return true;
  }
  return false;
}

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
  const { appKey, appModules } = payload;
  const { context, log } = deps;

  // Resolve the active context and adapter — both are required to fall back.
  const activeContext = appModules.context.currentContext;
  if (!activeContext) return;
  const adapter = resolveAdapter(
    { appKey, appContext: appModules.context, currentURL },
    deps.config.adapters,
  );
  if (!adapter) return;

  log(`URL guard: URL has context [${urlContextId}] for [${appKey}] — setting context from URL`);

  // Attempt to set context from the URL-decoded ID.
  // On failure (e.g. context deleted), fall back to re-encoding the active context.
  context.setCurrentContextByIdAsync(urlContextId).catch(() => {
    applyNavigation({ appKey, appModules, adapter, context: activeContext, currentURL }, deps);
  });
}

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
  const { appKey, appModules } = payload;
  const { log } = deps;

  // Resolve the active context and adapter for re-encoding.
  const activeContext = appModules.context.currentContext;
  if (!activeContext) return;
  const adapter = resolveAdapter(
    { appKey, appContext: appModules.context, currentURL },
    deps.config.adapters,
  );
  if (!adapter) return;

  log(`URL guard: context missing from URL, re-applying for [${appKey}]`);
  applyNavigation({ appKey, appModules, adapter, context: activeContext, currentURL }, deps);
}
