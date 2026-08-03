import type { FrameworkOptions } from '@equinor/fusion-framework-module-app';
import { CONTEXT_QUERY_PARAM_KEY } from '../../constants';
import { parseAppRoute } from './parse-app-route';
import { buildAppRoute } from './build-app-route';

/**
 * Builds the correct context URL for the given routing strategy.
 *
 * Designed for `setContextPathGenerator` — the adapter layer handles
 * runtime URL encoding; this is only for the context module's own hooks.
 *
 * @param contextId - The context id to embed in the URL, or `undefined` to clear it.
 * @param path - The current URL path to modify.
 * @param routingStrategy - The routing strategy (`'query'` or `'path'`).
 * @returns The modified URL path with the context id applied.
 */
export const buildContextUrlForStrategy = (
  contextId: string | undefined,
  path: string,
  routingStrategy?: FrameworkOptions['contextRouting'],
): string => {
  // Query routing keeps context out of the path — safer for apps that parse their own routes
  if (routingStrategy === 'query') {
    try {
      const url = new URL(path, 'http://localhost');
      // Keep the query param in sync with context lifecycle — cleared when context is removed
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

  // Path routing embeds the context id directly in the URL structure
  const match = parseAppRoute(path);

  // Path is not a recognised app route — return it unchanged
  if (!match) {
    return path;
  }

  return buildAppRoute(match.appKey, contextId ?? undefined);
};
