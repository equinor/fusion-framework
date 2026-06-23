import type { ContextItem } from '@equinor/fusion-framework-module-context';
import type { ContextNavigationAdapter, AdapterResolutionContext } from './types';
import { hasCustomContextGenerators } from '../utils/has-custom-context-generators';
import { stripContextQueryParam } from '../utils/url/strip-context-query-param';
import { parseAppRoute, buildAppRoute } from '../utils/url/app-route';
import { UUID_PATTERN } from '../constants';

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
 * **Context detection:** Uses `parseAppRoute` (URLPattern-based) to parse
 * the path into named segments, and UUID pattern matching to distinguish
 * context ids from route names.
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
    canHandle({ appContext, routingStrategy }: AdapterResolutionContext): boolean {
      // Apps with custom generators are owned by the custom adapter
      if (hasCustomContextGenerators(appContext)) {
        return false;
      }

      const declared = routingStrategy;
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
     * - **Null context:** removes the context segment to produce a bare app route.
     * - **Active context:** places/replaces the context id as the segment after the app key.
     *
     * Sub-routes after the context segment are intentionally dropped — a context
     * change resets the app to its root view to avoid landing in an invalid state.
     */
    encode({ context, currentURL }: { context: ContextItem | null; currentURL: URL }): URL | null {
      const match = parseAppRoute(currentURL.pathname);
      if (!match) return null;

      const targetPath =
        context === null ? buildAppRoute(match.appKey) : buildAppRoute(match.appKey, context.id);

      const url = new URL(targetPath, currentURL.origin);
      url.search = currentURL.search;
      stripContextQueryParam(url);
      // Hash is intentionally not preserved — context changes reset app to root view
      return url;
    },

    /**
     * Extract context id from the path segment after the app key, if it matches a UUID.
     *
     * Returns `null` for non-UUID segments (route names, missing segments).
     */
    decode(url: URL): string | null {
      const match = parseAppRoute(url.pathname);
      if (match?.contextId && UUID_PATTERN.test(match.contextId)) {
        return match.contextId;
      }
      return null;
    },
  };
}
