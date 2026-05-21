import type { ContextModuleConfig } from '@equinor/fusion-framework-module-context';
import type { IContextProvider } from '@equinor/fusion-framework-module-context';

import { readContextIdFromAppPath, writeContextIdToAppPath } from './path-utils';
import { readContextIdFromQueryParam, writeContextIdToQueryParam } from './query-utils';

// Re-export path and query utils so existing imports from './url-utils' keep working.
export {
  splitRelativePath,
  readContextIdFromAppPath,
  writeContextIdToAppPath,
  isBarAppRouteWithoutContext,
  appendContextToAppRoute,
} from './path-utils';
export {
  CONTEXT_QUERY_PARAM_KEY,
  writeContextIdToQueryParam,
  readContextIdFromQueryParam,
} from './query-utils';

// ── Strategy dispatch ────────────────────────────────────────────────

/** Extracts context id using query-first strategy (query param wins over path segment). */
export const resolveContextIdFromUrl = (path: string): string | undefined =>
  readContextIdFromQueryParam(path) ?? readContextIdFromAppPath(path);

/**
 * Builds the correct context URL for the active routing strategy.
 *
 * - `'query'`  → `$contextId` query parameter
 * - `'path'`   → 3rd path segment
 * - `undefined` → falls back to path (legacy default)
 *
 * Apps with custom URL shapes are handled by the custom adapter and
 * never reach this helper — their `generatePathFromContext` hook
 * produces the URL directly.
 */
export const buildContextUrlForStrategy = (
  contextId: string | undefined,
  path: string,
  routingStrategy?: ContextModuleConfig['routingStrategy'],
): string => {
  switch (routingStrategy) {
    case 'query':
      return writeContextIdToQueryParam(path, contextId);
    case 'path':
      return writeContextIdToAppPath(path, contextId);
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
