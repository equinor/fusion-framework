import { normalizeUri } from './normalize-uri';

/**
 * Compares normalized version of urls
 *
 * @internal
 */
export const compareOrigin = (a: string, b: string): boolean => {
  const url = { a: normalizeUri(a), b: normalizeUri(b) };
  return url.a === url.b;
};
