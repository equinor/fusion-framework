import type { ContextItem } from '@equinor/fusion-framework-module-context';
import type { ContextNavigationAdapter, AdapterResolutionContext } from '../types';
import { hasCustomContextGenerators } from '../utils/has-custom-context-generators';
import { stripContextQueryParam } from '../utils/url/strip-context-query-param';

/**
 * Regex matching a standard UUID (v4 format, case-insensitive).
 *
 * Used to identify whether a path segment is a context id vs. a route name.
 * Context ids in Fusion are always UUIDs, so this is a reliable discriminator.
 */
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Path adapter — encodes context identity as the first path segment after
 * the app basename.
 *
 * **Intent:** This is the legacy/default strategy for Fusion apps. It places
 * the context UUID immediately after `/apps/{appKey}/` as a path segment,
 * making context visible in the URL structure. This convention predates the
 * query strategy and remains the fallback for apps that don't declare a
 * routing strategy.
 *
 * **URL shape:** `/apps/{appKey}/{contextId}/...`
 *
 * **Selection logic:**
 * 1. Immediately bails if the app has custom generators registered
 *    (those apps are owned by the custom adapter).
 * 2. Matches when `routingStrategy === 'path'` (explicit opt-in).
 * 3. Matches when no strategy is declared (default fallback).
 *
 * **Query string handling:** Always carries forward `currentURL.search`
 * to the output URL, preserving all existing query parameters.
 *
 * **Context detection:** Uses UUID pattern matching on the third path
 * segment (index 2) to distinguish context ids from route names.
 *
 * @returns A static adapter object
 */
export function createPathAdapter(): ContextNavigationAdapter {
  return {
    id: 'path',

    /**
     * Self-selection predicate.
     *
     * Rejects apps with custom generators (they belong to the custom adapter).
     * Accepts apps with explicit `'path'` strategy or no declared strategy
     * (the path adapter serves as the system-wide default fallback).
     */
    canHandle({ appContext }: AdapterResolutionContext): boolean {
      // Apps with custom generators are owned by the custom adapter
      if (hasCustomContextGenerators(appContext)) {
        return false;
      }

      const declared = appContext.routingStrategy;
      // Explicit path strategy
      if (declared === 'path') {
        return true;
      }
      // No strategy declared — path is the default fallback
      if (declared === undefined || declared === null) {
        return true;
      }

      return false;
    },

    /**
     * Encode context into the URL as a path segment.
     *
     * - **Null context:** removes the UUID segment (if present) to produce
     *   a clean app root URL. Preserves trailing slash for basename matching.
     * - **Active context with existing UUID in URL:** replaces the segment in-place.
     * - **Active context without UUID in URL:** inserts the context id as
     *   the first segment after the app key.
     */
    encode({ context, currentURL }: { context: ContextItem | null; currentURL: URL }): URL | null {
      const { pathname } = currentURL;
      // Expected shape: /apps/{appKey}/...
      const segments = pathname.split('/').filter(Boolean);
      // segments[0] = 'apps', segments[1] = appKey, segments[2] = maybe contextId

      if (context === null) {
        // Clear: remove context segment if present
        if (segments.length >= 3 && UUID_PATTERN.test(segments[2])) {
          segments.splice(2, 1);
        }
        const url = new URL(`/${segments.join('/')}`, currentURL.origin);
        url.search = currentURL.search;
        // Remove query-adapter param — context is encoded in the path, not the query string
        stripContextQueryParam(url);
        return url;
      }

      // Set/replace context segment
      if (segments.length >= 3 && UUID_PATTERN.test(segments[2])) {
        segments[2] = context.id;
      } else {
        segments.splice(2, 0, context.id);
      }

      const url = new URL(`/${segments.join('/')}`, currentURL.origin);
      url.search = currentURL.search;
      // Remove query-adapter param — context is encoded in the path, not the query string
      stripContextQueryParam(url);
      return url;
    },

    /**
     * Extract context id from the third path segment if it matches a UUID.
     *
     * Only looks at position `segments[2]` (after `apps` and `appKey`).
     * Returns `null` for non-UUID segments (route names, missing segments).
     */
    decode(url: URL): string | null {
      const segments = url.pathname.split('/').filter(Boolean);
      // segments[0] = 'apps', segments[1] = appKey, segments[2] = maybe contextId
      if (segments.length >= 3 && UUID_PATTERN.test(segments[2])) {
        return segments[2];
      }
      return null;
    },
  };
}
