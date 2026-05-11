import type { ContextItem } from '@equinor/fusion-framework-module-context';
import type { ContextNavigationAdapter, AdapterResolutionContext } from '../types';
import { hasCustomContextGenerators } from '../utils/has-custom-context-generators';

const UUID_PATTERN = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;

/**
 * Path adapter — encodes context ID as the first path segment after the app basename.
 *
 * URL shape: `/apps/{appKey}/{contextId}/...`
 *
 * Fallback adapter: handles apps that declare `routingStrategy: 'path'` or
 * have no explicit strategy and no custom generators registered.
 * Apps with custom generators are handled by the custom adapter instead.
 */
export function createPathAdapter(): ContextNavigationAdapter {
  return {
    id: 'path',

    canHandle({ appContext }: AdapterResolutionContext): boolean {
      // Skip apps with custom generators — those belong to the custom adapter
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
        const url = new URL(`/${segments.join('/')}/`, currentURL.origin);
        url.search = currentURL.search;
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
      return url;
    },

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
