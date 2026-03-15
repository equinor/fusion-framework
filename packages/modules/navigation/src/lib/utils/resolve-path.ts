import type { Path, To } from '../types';
import { pathToUrl } from './path-to-url';

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
  const { pathname, search, hash } = pathToUrl(to);
  return { pathname, search, hash };
};
