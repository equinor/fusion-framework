import { CONTEXT_QUERY_PARAM_KEY } from '../../constants';

/**
 * Removes the `$contextId` query parameter from a URL in-place.
 *
 * Path and custom adapters encode context in the URL path, not the query
 * string. If a previous adapter (or an external link) left `$contextId`
 * in the query, carrying it forward creates a confusing duplicate signal.
 * This utility strips it so the URL only contains the path-based encoding.
 *
 * @param url - The URL object to mutate (parameter is deleted in-place).
 */
export function stripContextQueryParam(url: URL): void {
  if (url.searchParams.has(CONTEXT_QUERY_PARAM_KEY)) {
    url.searchParams.delete(CONTEXT_QUERY_PARAM_KEY);
    // Restore $ from %24 encoding in remaining params
    url.search = url.search.replace(/%24/gi, '$');
  }
}
