import { UUID_PATTERN } from '../../constants';
import type { AppRouteMatch } from './parse-app-route';

/**
 * Reconstructs the full sub-route tail from a parsed app route.
 *
 * `contextId` is a positional capture, not a verified context — when the URL has
 * no active context that slot actually holds a route name (e.g. "settings" in
 * `/apps/app/settings/general`). Folding it back into the tail prevents it from
 * being silently discarded when a real context id is substituted into that slot.
 *
 * @param match - The `contextId`/`rest` segments from `parseAppRoute`.
 * @returns The full sub-route tail, or `undefined` when there is none.
 */
export const resolveRouteTail = (
  match: Pick<AppRouteMatch, 'contextId' | 'rest'>,
): string | undefined => {
  // A UUID in this slot is a real context id — the tail is just whatever follows it
  if (match.contextId && UUID_PATTERN.test(match.contextId)) {
    return match.rest;
  }
  // Otherwise the slot is a route name, not a context — rejoin it with the rest to keep the full tail
  return [match.contextId, match.rest].filter(Boolean).join('/') || undefined;
};
