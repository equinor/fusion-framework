import type { Path } from '../types';
import { encodeTrailingWhitespace } from './encode-trailing-whitespace';

/**
 * Converts a Partial<Path> object to a path string.
 *
 * @param to - The path object with optional pathname, search, and hash
 * @returns A path string with properly formatted search and hash
 *
 * @example
 * ```ts
 * pathToString({ pathname: '/users', search: '?id=1', hash: '#section' })
 * // '/users?id=1#section'
 *
 * pathToString({ pathname: '/users', search: 'id=1', hash: 'section' })
 * // '/users?id=1#section'
 * ```
 */
export const pathToString = (to: Partial<Path>): string => {
  const pathname = encodeTrailingWhitespace(to.pathname ?? '/');
  const search = encodeTrailingWhitespace(to.search?.replace(/^\?/, '') ?? '');
  const hash = encodeTrailingWhitespace(to.hash?.replace(/^#/, '') ?? '');
  return `${pathname}${search ? `?${search}` : ''}${hash ? `#${hash}` : ''}`;
};
