import type { Location } from '../types';
import { resolvePath } from './resolve-path';

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
 * Resolves the current location from window.location.
 * @param window - The window object to extract location from.
 * @param target - Optional target object with state.
 * @returns The current browser navigation location.
 */
export const resolveWindowLocation = (window: Window, target?: { state: unknown }): Location => {
  const { pathname, search, hash } = resolvePath(window.location);
  const { state, key } = resolveState(target);
  return { pathname, search, hash, state, key, unstable_mask: undefined };
};
