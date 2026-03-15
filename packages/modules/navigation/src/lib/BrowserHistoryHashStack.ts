import { BrowserHistoryStack } from './BrowserHistoryStack';
import type { Location, To } from './types';
import { resolveHashLocation, resolvePath, pathToString } from './utils';

/**
 * Browser history hash stack implementation using hash-based routing.
 *
 * Uses URL hash fragment (#) instead of pathname. The hash is not sent to the server,
 * allowing routing without server configuration.
 *
 * @example
 * ```ts
 * // Regular routing: https://example.com/users
 * // Hash routing: https://example.com/#/users
 * const stack = new BrowserHistoryHashStack(window);
 * ```
 */
export class BrowserHistoryHashStack extends BrowserHistoryStack {
  /**
   * Gets the current location from window.location.hash.
   */
  public get current(): Readonly<Location> {
    return resolveHashLocation(this._window);
  }

  /**
   * Creates a URL object for a given path with hash-based routing.
   *
   * Uses the current window location as the base and only modifies the hash fragment.
   * The path is normalized to ensure it starts with '#' if not already present.
   *
   * @param to - The target path (string, Path object, or Location object)
   * @returns A URL object with the path in the hash fragment
   *
   * @example
   * ```ts
   * // If current URL is 'https://example.com/app'
   * createURL('/users?id=1')
   * // URL { href: 'https://example.com/app#/users?id=1', ... }
   *
   * createURL({ pathname: '/dashboard', search: '?tab=settings' })
   * // URL { href: 'https://example.com/app#/dashboard?tab=settings', ... }
   * ```
   */
  public override createURL(to: To): URL {
    const path = resolvePath(to);
    const fullPath = pathToString(path);
    // Normalize: ensure path starts with '#' for hash routing
    const hashPath = fullPath.startsWith('#') ? fullPath : `#${fullPath}`;
    // Use current location as base, only modify hash
    const url = new URL(this._window.location.href, this.origin);
    url.hash = hashPath;

    return url;
  }
}
