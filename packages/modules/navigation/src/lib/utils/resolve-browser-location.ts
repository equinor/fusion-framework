import type { Location } from '../types';
import { resolvePath } from './resolve-path';

const resolveState = (target?: { state: unknown }): { state: unknown; key: string } => {
  const { value, key = 'unknown' } = (target ?? window.history).state ?? ({} as {
    value: unknown;
    key?: string;
  });
  return { state: value, key };
};

/**
 * Resolves the current location from window.location.
 *
 * @param window - The window object to extract location from
 * @param target - Optional target object with state
 * @returns The current location with pathname, search, hash, state, and key
 *
 * @example
 * ```ts
 * // If window.location is 'https://example.com/users?id=1#section'
 * resolveWindowLocation(window)
 * // { pathname: '/users', search: '?id=1', hash: '#section', state: undefined, key: 'unknown' }
 *
 * resolveWindowLocation(window, { state: { userId: 123 } })
 * // { pathname: '/users', search: '?id=1', hash: '#section', state: { userId: 123 }, key: 'abc123' }
 * ```
 */
export const resolveWindowLocation = (window: Window, target?: { state: unknown }): Location => {
  const { pathname, search, hash } = resolvePath(window.location);
  const { state, key } = resolveState(target);
  return { pathname, search, hash, state, key };
};

/**
 * Resolves the current location from window.location.hash.
 *
 * @param window - The window object to extract location from
 * @param target - Optional target object with state
 * @returns The current location with pathname, search, hash, state, and key
 *
 * @example
 * ```ts
 * // If window.location.hash is '#/users?id=1#section'
 * resolveHashLocation(window)
 * // { pathname: '/users', search: '?id=1', hash: '#section', state: undefined, key: 'unknown' }
 *
 * // If window.location.hash is '#/dashboard'
 * resolveHashLocation(window)
 * // { pathname: '/dashboard', search: '', hash: '', state: undefined, key: 'unknown' }
 * ```
 */
export const resolveHashLocation = (window: Window, target?: { state: unknown }): Location => {
  const location = resolveWindowLocation(window, target);
  const { pathname, search, hash } = resolvePath(location.hash?.replace('#', '') ?? '');
  const { state, key } = resolveState(target);
  return { pathname, search, hash, state, key };
};
