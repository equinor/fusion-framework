import type { To } from '../types';
import { isAbsoluteUrl } from './is-absolute-url';
import { pathToString } from './path-to-string';

const stripTrailingWhitespace = (input: string): string => {
  return input.replace(/ $/, '%20');
};

/**
 * Converts a path to a URL object.
 *
 * @param path - The target path (string, Path object, or Location object)
 * @param origin - Optional origin URL (defaults to 'http://localhost')
 * @returns A URL object for the given path
 *
 * @example
 * ```ts
 * pathToUrl('/users?id=1', 'https://example.com')
 * // URL { href: 'https://example.com/users?id=1', ... }
 *
 * pathToUrl('https://example.com/users')
 * // URL { href: 'https://example.com/users', ... }
 *
 * pathToUrl({ pathname: '/users', search: '?id=1' })
 * // URL { href: 'http://localhost/users?id=1', ... }
 * ```
 */
export const pathToUrl = (path: To, origin?: string): URL => {
  const pathString = typeof path === 'string' ? stripTrailingWhitespace(path) : pathToString(path);
  return isAbsoluteUrl(pathString)
    ? new URL(pathString)
    : new URL(pathString, origin ?? 'http://localhost');
};
