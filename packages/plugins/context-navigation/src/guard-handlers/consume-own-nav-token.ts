import { normalizePath } from '../helpers';
import type { OwnNavigationTokens } from '../apply-navigation';

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
  // Token present — this navigation was plugin-initiated; consume it and signal the caller to bail.
  if (ownNavTokens.has(normalized)) {
    ownNavTokens.delete(normalized);
    return true;
  }
  return false;
}
