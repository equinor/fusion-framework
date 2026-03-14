import { normalizeUri } from './normalize-uri';

/**
 * Compares two URIs after normalizing them to their canonical form.
 *
 * Both values are passed through {@link normalizeUri} before comparison, so relative
 * paths, double slashes, and trailing slashes are handled transparently.
 *
 * @internal
 *
 * @param a - First URI or relative path
 * @param b - Second URI or relative path
 * @returns `true` when both URIs resolve to the same normalized string
 */
export const compareOrigin = (a: string, b: string): boolean => {
  const url = { a: normalizeUri(a), b: normalizeUri(b) };
  return url.a === url.b;
};
