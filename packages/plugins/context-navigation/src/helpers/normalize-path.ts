/**
 * Normalize a URL to its path + search representation for comparison.
 *
 * Strips trailing slashes from the pathname so that `/apps/foo/` and
 * `/apps/foo` compare as equal.
 *
 * @param url - The URL to normalize.
 * @returns A string of the form `pathname + search` with trailing slash removed.
 */
export function normalizePath(url: URL): string {
  return `${url.pathname.replace(/\/$/, '') || '/'}${url.search}`;
}
