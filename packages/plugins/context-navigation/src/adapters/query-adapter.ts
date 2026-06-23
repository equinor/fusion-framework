import type { ContextItem } from '@equinor/fusion-framework-module-context';
import type { ContextNavigationAdapter, AdapterResolutionContext } from './types';
import { CONTEXT_QUERY_PARAM_KEY } from '../constants';

/**
 * Query adapter — encodes context identity as a URL query parameter.
 *
 * **Intent:** This is the preferred strategy for new apps. It keeps the
 * pathname clean for app routing while storing context in a predictable
 * query param (`?$contextId={uuid}`). This avoids conflicts with
 * React Router path segments and makes deep-links copy-pasteable without
 * affecting route matching.
 *
 * **URL shape:** `/apps/{appKey}/route?$contextId={id}`
 *
 * **Selection:** Matches only when the app explicitly declares
 * `routingStrategy: 'query'` on its context provider. Does not
 * fall through as a default — that role belongs to the path adapter.
 *
 * **Query string handling:** Clones the full current URL (`currentURL.href`)
 * so all existing query parameters are preserved. Only the context param
 * is added/removed/replaced.
 *
 * @param paramName - Query parameter name to use (default `$contextId`)
 * @returns A static adapter object (not a factory — no runtime binding needed)
 *
 * @example
 * ```ts
 * // Default param name
 * const adapter = createQueryAdapter();
 *
 * // Custom param name for portal-specific needs
 * const adapter = createQueryAdapter('contextId');
 * ```
 */
export function createQueryAdapter(paramName = CONTEXT_QUERY_PARAM_KEY): ContextNavigationAdapter {
  return {
    id: 'query',

    /**
     * Matches apps that explicitly opted into query-parameter context routing.
     *
     * Only returns `true` when `routingStrategy === 'query'` — there is no
     * implicit fallback. Apps without a declared strategy use the path adapter.
     */
    canHandle({ routingStrategy }: AdapterResolutionContext): boolean {
      return routingStrategy === 'query';
    },

    /**
     * Encode context into the URL's query string.
     *
     * - **Null context:** removes the context param (clears deep-link).
     * - **Active context:** sets the param to the context id.
     *
     * After mutation, the `$` character is restored from `%24` encoding
     * because `URLSearchParams` percent-encodes `$` but we want it
     * human-readable in the address bar as a namespace marker.
     *
     * Hash fragment is intentionally cleared — context changes reset the app
     * to its root view, so any hash pointing to sub-route sections would be invalid.
     */
    encode({ context, currentURL }: { context: ContextItem | null; currentURL: URL }): URL | null {
      const url = new URL(currentURL.href);

      if (context === null) {
        url.searchParams.delete(paramName);
      } else {
        url.searchParams.set(paramName, context.id);
      }

      // Restore $ from %24 — $ is a reserved namespace prefix we want visible in URLs
      url.search = url.search.replace(/%24/gi, '$');

      // Clear hash — context change resets app to root view
      url.hash = '';

      return url;
    },

    /**
     * Extract the context id from the query parameter.
     *
     * @returns The context id string, or `null` if the param is absent.
     */
    decode(url: URL): string | null {
      return url.searchParams.get(paramName) ?? null;
    },
  };
}
