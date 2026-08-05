/**
 * Strip all query parameters from a URL.
 *
 * Used on app switches to give the adapter a clean URL. The adapter's
 * `encode()` will add back whatever params it needs (e.g. `$contextId`
 * for query-strategy apps). On context-only changes within the same app,
 * this function is not called — query params survive naturally.
 *
 * @param url - The URL to strip (mutated in-place).
 */
export function stripQueryParams(url: URL): void {
  url.search = '';
}
