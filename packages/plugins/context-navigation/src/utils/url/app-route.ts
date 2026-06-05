/**
 * URLPattern for the standard Fusion portal app route:
 *
 *   /apps/:appKey              — bare app route
 *   /apps/:appKey/:contextId   — app with context
 *   /apps/:appKey/:contextId/… — app with context + sub-routes
 *
 * Named groups give direct access to path segments.
 * Instantiated once at module scope — pattern compilation is O(1) thereafter.
 */
const APP_ROUTE_PATTERN = new URLPattern({
  pathname: '/apps/:appKey/:contextId?/:rest*',
});

/** Parsed app route segments from a URLPattern match. */
export interface AppRouteMatch {
  appKey: string;
  /** Context id segment (3rd path part). Undefined when bare app route. */
  contextId?: string;
  /** App-owned sub-routes after the context segment (e.g. "settings/general"). */
  rest?: string;
}

/**
 * Parses `/apps/:appKey/:contextId?/…rest` into named segments.
 *
 * Trailing slashes are stripped before matching because URLPattern's
 * pathname matching does not treat `/apps/my-app/` and `/apps/my-app`
 * as equivalent.
 *
 * @returns Named segments, or undefined if the pathname is not an app route.
 */
export const parseAppRoute = (pathname: string): AppRouteMatch | undefined => {
  if (!pathname[0] || pathname[0] !== '/') {
    pathname = `/${pathname}`;
  }

  const normalized = pathname.replace(/\/+$/, '') || '/';
  const result = APP_ROUTE_PATTERN.exec({ pathname: normalized });
  if (!result) return undefined;
  const { appKey, contextId, rest } = result.pathname.groups;
  if (!appKey) return undefined;
  return {
    appKey,
    contextId: contextId || undefined,
    rest: rest || undefined,
  };
};

/**
 * Builds `/apps/:appKey[/:contextId][/:rest]` from named segments.
 * Inverse of `parseAppRoute` — used by all write/upsert helpers.
 */
export const buildAppRoute = (appKey: string, contextId?: string, rest?: string): string => {
  let path = `/apps/${appKey}`;
  if (contextId) path += `/${contextId}`;
  if (rest) path += `/${rest}`;
  return path;
};
