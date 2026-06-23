export { parseAppRoute, buildAppRoute } from './app-route';
export type { AppRouteMatch } from './app-route';

export { stripContextQueryParam } from './strip-context-query-param';

export { CONTEXT_QUERY_PARAM_KEY, UUID_PATTERN } from '../../constants';

// ── Thin wrappers for context-module URL hooks ──────────────────────
//
// These functions exist solely to wire the context module's legacy
// `setContextPathGenerator` / `setContextPathExtractor` hooks.
// All runtime URL handling goes through the adapter layer instead.

import type { FrameworkOptions } from '@equinor/fusion-framework-module-app';
import { parseAppRoute, buildAppRoute } from './app-route';
import { UUID_PATTERN, CONTEXT_QUERY_PARAM_KEY } from '../../constants';

/**
 * Extracts a context id from a URL string by checking the query param
 * first, then falling back to the path segment.
 *
 * Designed for `setContextPathExtractor` — the adapter layer handles
 * runtime URL decoding; this is only for the context module's own hooks.
 */
export const resolveContextIdFromUrl = (path: string): string | undefined => {
  // Check query parameter first
  try {
    const url = new URL(path, 'http://localhost');
    const fromQuery = url.searchParams.get(CONTEXT_QUERY_PARAM_KEY) ?? undefined;
    if (fromQuery) return fromQuery;
  } catch {
    // path may not be a valid URL — continue to path parsing
  }

  // Fall back to path segment
  const match = parseAppRoute(path);
  if (match?.contextId && UUID_PATTERN.test(match.contextId)) {
    return match.contextId;
  }
  return undefined;
};

/**
 * Builds the correct context URL for the given routing strategy.
 *
 * Designed for `setContextPathGenerator` — the adapter layer handles
 * runtime URL encoding; this is only for the context module's own hooks.
 */
export const buildContextUrlForStrategy = (
  contextId: string | undefined,
  path: string,
  routingStrategy?: FrameworkOptions['contextRouting'],
): string => {
  if (routingStrategy === 'query') {
    try {
      const url = new URL(path, 'http://localhost');
      if (contextId) {
        url.searchParams.set(CONTEXT_QUERY_PARAM_KEY, contextId);
      } else {
        url.searchParams.delete(CONTEXT_QUERY_PARAM_KEY);
      }
      // Restore $ from %24 encoding
      url.search = url.search.replace(/%24/gi, '$');
      return `${url.pathname}${url.search}${url.hash}`;
    } catch {
      return path;
    }
  }

  // 'path' or default — encode as path segment
  const match = parseAppRoute(path);
  if (!match) return path;
  return buildAppRoute(match.appKey, contextId ?? undefined);
};
