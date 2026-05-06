import { parseAppRoute, buildAppRoute } from './app-route';

/** Splits a relative URL into pathname, search, and hash (without delimiters). */
export const splitRelativePath = (
  path: string,
): { pathname: string; search: string; hash: string } => {
  const [withSearch, hash = ''] = path.split('#', 2);
  const [pathname, search = ''] = withSearch.split('?', 2);
  return { pathname, search, hash };
};

// ── Path-segment helpers (URLPattern-based) ──────────────────────────

/** Reads context id from `/apps/:appKey/:contextId`. */
export const readContextIdFromAppPath = (path: string): string | undefined => {
  const { pathname } = splitRelativePath(path);
  return parseAppRoute(pathname)?.contextId;
};

/** Embeds context id as path segment, or clears it. */
export const writeContextIdToAppPath = (path: string, contextId?: string): string => {
  console.debug(`🌍 Portal: writeContextIdToAppPath!`, { path, contextId });
  const { pathname } = splitRelativePath(path);
  const match = parseAppRoute(pathname);
  console.debug(`🌍 Portal: Parsed app route:`, { match });
  if (!match) return path;
  return buildAppRoute(match.appKey, contextId ?? undefined);
};

/** Returns true when pathname is a bare app route without context. */
export const isBarAppRouteWithoutContext = (pathname: string): boolean => {
  const match = parseAppRoute(pathname);
  return !!match && !match.contextId;
};

/** Appends context id segment to a bare app route pathname. */
export const appendContextToAppRoute = (pathname: string, contextId: string): string =>
  `${pathname.replace(/\/+$/, '')}/${contextId}`;
