import type { To } from '../types';
import { encodeTrailingWhitespace } from './encode-trailing-whitespace';
import { hasProtocol } from './has-protocol';
import { pathToString } from './path-to-string';

/**
 * Converts a path to a URL object.
 *
 * This utility handles various path formats and converts them to standard URL objects.
 * It supports absolute URLs, relative paths, and path objects with pathname/search/hash.
 *
 * @param path - The target path (string, Path object, or Location object)
 * @param origin - Optional origin URL. Defaults to `window.location.origin` in browser environments,
 *                 or 'http://localhost' in Node.js environments
 * @returns A URL object for the given path
 *
 * @example
 * ```ts
 * // Absolute URL with custom origin
 * pathToUrl('/users?id=1', 'https://example.com')
 * // URL { href: 'https://example.com/users?id=1', ... }
 *
 * // Complete URL with protocol
 * pathToUrl('https://example.com/users')
 * // URL { href: 'https://example.com/users', ... }
 *
 * // Path object
 * pathToUrl({ pathname: '/users', search: '?id=1' })
 * // URL { href: 'http://localhost/users?id=1', ... }
 *
 * // Browser environment (uses window.location.origin)
 * pathToUrl('/dashboard')
 * // URL { href: 'https://current-site.com/dashboard', ... }
 * ```
 */
export const pathToUrl = (path: To, origin?: string): URL => {
  // Convert path to string representation
  const pathString = typeof path === 'string' ? encodeTrailingWhitespace(path) : pathToString(path);

  // If path already has a protocol, it's a complete URL
  if (hasProtocol(pathString)) {
    return new URL(pathString);
  }

  // Determine the origin to use for relative paths
  const resolvedOrigin =
    origin ??
    (typeof window !== 'undefined' ? window.location?.origin : undefined) ??
    'http://localhost';

  return new URL(pathString, resolvedOrigin);
};
