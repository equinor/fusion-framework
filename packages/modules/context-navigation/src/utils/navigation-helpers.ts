import { CONTEXT_QUERY_PARAM_KEY, appendContextToAppRoute } from './url-utils';
import { parseAppRoute, buildAppRoute } from './app-route';

/** UUID v4 shape — used to distinguish context ids from app sub-route segments. */
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Reads app key from `/apps/:appKey/…`. */
export const readAppKeyFromPathname = (pathname: string): string | undefined =>
  parseAppRoute(pathname)?.appKey;

/**
 * Removes the context segment from an app pathname, preserving sub-routes.
 *
 * `/apps/my-app/abc-123/settings` → `/apps/my-app/settings`
 */
export const stripContextSegmentFromAppPath = (pathname: string, contextId?: string): string => {
  if (!contextId) return pathname;
  const match = parseAppRoute(pathname);
  if (!match || match.contextId !== contextId) return pathname;
  return buildAppRoute(match.appKey, undefined, match.rest);
};

/**
 * Replaces or inserts the context id in an app route, preserving sub-routes.
 *
 * - Existing UUID segment → replaced:
 *   `/apps/my-app/old-id/settings` → `/apps/my-app/new-id/settings`
 * - No UUID segment → inserted before remaining segments:
 *   `/apps/my-app/settings` → `/apps/my-app/new-id/settings`
 * - Bare route → appended:
 *   `/apps/my-app` → `/apps/my-app/new-id`
 */
export const upsertContextSegmentInAppPath = (pathname: string, contextId: string): string => {
  const match = parseAppRoute(pathname);
  if (!match) return appendContextToAppRoute(pathname, contextId);

  /** Existing segment is a UUID — replace it, keep sub-routes. */
  if (match.contextId && UUID_PATTERN.test(match.contextId)) {
    return buildAppRoute(match.appKey, contextId, match.rest);
  }

  /**
   * Existing segment is NOT a UUID (e.g. "settings") — it's a sub-route
   * that was parsed as contextId. Insert the real context before it.
   */
  const trailingSubroutes = match.contextId
    ? match.rest
      ? `${match.contextId}/${match.rest}`
      : match.contextId
    : match.rest;
  return buildAppRoute(match.appKey, contextId, trailingSubroutes);
};

/** Writes context id to `$contextId` query parameter, preserving existing params. */
export const buildQuerySearchWithContextId = (
  currentSearch: string | undefined,
  contextId: string,
): string => {
  const params = new URLSearchParams((currentSearch ?? '').replace(/^\?/, ''));
  params.set(CONTEXT_QUERY_PARAM_KEY, contextId);
  const serialized = Array.from(params.entries())
    .map(([key, value]) => {
      const encodedKey = key === '$contextId' ? '$contextId' : encodeURIComponent(key);
      return `${encodedKey}=${encodeURIComponent(value)}`;
    })
    .join('&');
  return serialized ? `?${serialized}` : '';
};
