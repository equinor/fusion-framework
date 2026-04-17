import type { ContextModuleConfig } from '@equinor/fusion-framework-module-context';
import type { IContextProvider } from '@equinor/fusion-framework-module-context';
import { parseAppRoute, buildAppRoute } from './app-route';

/** Query-parameter key for context id in query-routing mode. */
export const CONTEXT_QUERY_PARAM_KEY = '$contextId';

/** Splits a relative URL into pathname, search, and hash (without delimiters). */
export const splitRelativePath = (
  path: string,
): { pathname: string; search: string; hash: string } => {
  const [withSearch, hash = ''] = path.split('#', 2);
  const [pathname, search = ''] = withSearch.split('?', 2);
  return { pathname, search, hash };
};

// ── Query-param helpers ──────────────────────────────────────────────

/** Serializes URLSearchParams keeping `$contextId` as a literal unencoded key. */
const serializeQueryKeepingCtxReadable = (params: URLSearchParams): string =>
  Array.from(params.entries())
    .map(([key, value]) => {
      const encodedKey =
        key === CONTEXT_QUERY_PARAM_KEY ? CONTEXT_QUERY_PARAM_KEY : encodeURIComponent(key);
      return `${encodedKey}=${encodeURIComponent(value)}`;
    })
    .join('&');

/** Writes context id to `$contextId` query param, or removes it when undefined. */
export const writeContextIdToQueryParam = (path: string, contextId?: string): string => {
  const { pathname, search, hash } = splitRelativePath(path);
  const params = new URLSearchParams(search);

  if (contextId) {
    params.set(CONTEXT_QUERY_PARAM_KEY, contextId);
  } else {
    params.delete(CONTEXT_QUERY_PARAM_KEY);
  }

  const nextSearch = serializeQueryKeepingCtxReadable(params);
  return `${pathname}${nextSearch ? `?${nextSearch}` : ''}${hash ? `#${hash}` : ''}`;
};

/** Reads `$contextId` query parameter value from a relative URL. */
export const readContextIdFromQueryParam = (path: string): string | undefined => {
  const { search } = splitRelativePath(path);
  return new URLSearchParams(search).get(CONTEXT_QUERY_PARAM_KEY) ?? undefined;
};

// ── Path-segment helpers (URLPattern-based) ──────────────────────────

/** Reads context id from `/apps/:appKey/:contextId`. */
export const readContextIdFromAppPath = (path: string): string | undefined => {
  const { pathname } = splitRelativePath(path);
  return parseAppRoute(pathname)?.contextId;
};

/** Embeds context id as path segment, or clears it. */
export const writeContextIdToAppPath = (path: string, contextId?: string): string => {
  const { pathname } = splitRelativePath(path);
  const match = parseAppRoute(pathname);
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

// ── Strategy dispatch ────────────────────────────────────────────────

/** Extracts context id using query-first strategy (query param wins over path segment). */
export const resolveContextIdFromUrl = (path: string): string | undefined =>
  readContextIdFromQueryParam(path) ?? readContextIdFromAppPath(path);

/**
 * Builds the correct context URL for the active routing strategy.
 *
 * - `'query'`  → `$contextId` query parameter
 * - `'path'`   → 3rd path segment
 * - `'custom'` → path unchanged (app manages its own URL)
 */
export const buildContextUrlForStrategy = (
  contextId: string | undefined,
  path: string,
  routingStrategy?: ContextModuleConfig['routingStrategy'],
): string => {
  switch (routingStrategy) {
    case 'custom':
      return path;
    case 'query':
      return writeContextIdToQueryParam(path, contextId);
    case 'path':
    default:
      return writeContextIdToAppPath(path, contextId);
  }
};

// ── Provider-level helpers (used by provider.ts) ─────────────────────

/**
 * Determines the context id to carry across an app switch.
 *
 * Priority order:
 * 1. The active context provider's current context id (already resolved)
 * 2. Context id parsed from the previous URL's path segment
 * 3. Context id parsed from the previous URL's `$contextId` query param
 *
 * Returns `undefined` when no context can be inferred.
 */
export const resolveContextIdToCarry = (
  activeContextProvider: IContextProvider | undefined,
  previousPath: { pathname: string; search: string } | undefined,
): string | undefined =>
  activeContextProvider?.currentContext?.id ??
  (previousPath ? readContextIdFromAppPath(previousPath.pathname) : undefined) ??
  (previousPath ? readContextIdFromQueryParam(previousPath.search) : undefined);

/**
 * Returns true when the target URL already contains the given context id
 * in at least one recognized position (path segment, query param, or
 * via the app's custom `extractContextIdFromPath`).
 *
 * Used by the app-switch subscription to avoid redundant navigation when
 * the user navigated to a URL that already includes the context.
 */
export const urlAlreadyHasContext = (
  location: { pathname: string; search: string },
  activeContextProvider: IContextProvider | undefined,
  contextId: string,
): boolean => {
  const extracted = activeContextProvider?.extractContextIdFromPath?.(location.pathname);
  const inPath = readContextIdFromAppPath(location.pathname);
  const inQuery = readContextIdFromQueryParam(location.search);
  return extracted === contextId || inPath === contextId || inQuery === contextId;
};
