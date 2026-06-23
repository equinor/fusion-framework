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
