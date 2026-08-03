import { normalizePath } from '../../helpers';
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
 * @param pathname - The URL pathname to parse.
 * @returns Named segments, or undefined if the pathname is not an app route.
 */
export const parseAppRoute = (pathname: string): AppRouteMatch | undefined => {
  // URLPattern requires an absolute path — prepend slash if missing
  if (!pathname[0] || pathname[0] !== '/') {
    pathname = `/${pathname}`;
  }

  const normalized = normalizePath(pathname);
  const result = APP_ROUTE_PATTERN.exec({ pathname: normalized });

  // Pathname does not match the /apps/:appKey pattern
  if (!result) {
    return undefined;
  }

  const { appKey, contextId, rest } = result.pathname.groups;

  // Guard against an empty appKey capture group (malformed pattern match)
  if (!appKey) {
    return undefined;
  }
  return {
    appKey,
    contextId: contextId || undefined,
    rest: rest || undefined,
  };
};
