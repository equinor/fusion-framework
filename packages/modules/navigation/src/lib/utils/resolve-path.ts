import type { Path, To } from '../types.js';
import { pathToUrl } from './path-to-url.js';

/**
 * Fixed base used only to parse relative values. Only pathname, search and hash
 * are read from the result, so the origin never leaks and `window.location` is
 * never consulted (memory histories must not depend on the host page).
 */
const PARSE_ORIGIN = 'http://localhost';

/**
 * Resolves a 'to' value into a Path object.
 *
 * @param to - The target path (string, Path object, or Location object)
 * @returns A Path object with the pathname, search, and hash components
 *
 * @example
 * ```ts
 * resolvePath('/users?id=1#section')
 * // { pathname: '/users', search: '?id=1', hash: '#section' }
 *
 * resolvePath({ pathname: '/users', search: 'id=1', hash: 'section' })
 * // { pathname: '/users', search: '?id=1', hash: '#section' }
 * ```
 */
export const resolvePath = (to: To): Path => {
  const { pathname, search, hash } = pathToUrl(to, PARSE_ORIGIN);
  return { pathname, search, hash };
};
