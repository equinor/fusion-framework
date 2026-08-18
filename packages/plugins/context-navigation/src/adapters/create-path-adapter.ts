import type { ContextItem } from '@equinor/fusion-framework-module-context';
import type { ContextNavigationAdapter, AdapterResolutionContext } from './types';
import { hasCustomContextGenerators } from '../utils/has-custom-context-generators';
import { stripContextQueryParam } from '../utils/url/strip-context-query-param';
import { parseAppRoute } from '../utils/url/parse-app-route';
import { UUID_PATTERN } from '../constants';
import { buildAppRoute } from '../utils/url/build-app-route';

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
    canHandle({ appContext, routingStrategy, currentURL }: AdapterResolutionContext): boolean {
      // Custom generators mean the app owns its URL shape — the custom adapter handles it, not us
      if (hasCustomContextGenerators(appContext)) {
        return false;
      }

      // Not an app route (e.g. portal chrome) — nothing for this adapter to encode context into
      if (!parseAppRoute(currentURL.pathname)) {
        return false;
      }

      const declared = routingStrategy;
      // App explicitly opted into path-segment routing — take ownership
      if (declared === 'path') {
        return true;
      }
      // No strategy declared — path adapter is the system-wide default for legacy apps
      if (declared === undefined || declared === null) {
        return true;
      }

      return false;
    },

    /**
     * Encode context into the URL as a path segment.
     *
     * - **Null context:** removes the context segment and drops any sub-route,
     *   resetting the app to its root view — there's no valid context to resolve
     *   the sub-route against.
     * - **Active context:** places/replaces the context id as the segment after
     *   the app key, preserving the existing sub-route.
     */
    encode({ context, currentURL }: { context: ContextItem | null; currentURL: URL }): URL | null {
      const match = parseAppRoute(currentURL.pathname);
      // Pathname doesn't match the /apps/{key}/... shape — not a Fusion app route, bail out
      if (!match) return null;

      const targetPath =
        context === null
          ? buildAppRoute(match.appKey)
          : buildAppRoute(match.appKey, context.id, match.rest);

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
      // Only treat the segment as a context id if it's a valid UUID — route names can occupy the same slot
      if (match?.contextId && UUID_PATTERN.test(match.contextId)) {
        return match.contextId;
      }
      return null;
    },
  };
}
