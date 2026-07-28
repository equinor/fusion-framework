import type { Location } from '../types';
import { resolvePath } from './resolve-path';
import { resolveWindowLocation } from './resolve-window-location';

const resolveState = (target?: { state: unknown }): { state: unknown; key: string } => {
  const { value, key = 'unknown' } =
    (target ?? window.history).state ??
    ({} as {
      value: unknown;
      key?: string;
    });
  return { state: value, key };
};

/**
 * Resolves the current location from window.location.hash.
 * @param window - The window object to extract location from.
 * @param target - Optional target object with state.
 * @returns The current hash-based navigation location.
 */
export const resolveHashLocation = (window: Window, target?: { state: unknown }): Location => {
  const location = resolveWindowLocation(window, target);
  const { pathname, search, hash } = resolvePath(location.hash?.replace('#', '') ?? '');
  const { state, key } = resolveState(target);
  return { pathname, search, hash, state, key, unstable_mask: undefined };
};
