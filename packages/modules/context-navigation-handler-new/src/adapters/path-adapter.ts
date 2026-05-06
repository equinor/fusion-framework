import type { ContextItem } from '@equinor/fusion-framework-module-context';
import type { ContextNavigationAdapter, AdapterResolutionContext } from '../types';

const UUID_PATTERN = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;

/**
 * Path adapter — encodes context ID as the first path segment after the app basename.
 *
 * URL shape: `/apps/{appKey}/{contextId}/...`
 *
 * This is the lowest-priority default adapter. It handles any app that
 * declares `routingStrategy: 'path'` or has no specific strategy configured
 * and no custom generators.
 */
export function createPathAdapter(): ContextNavigationAdapter {
  return {
    id: 'path',

    canHandle({ appContext }: AdapterResolutionContext): boolean {
      // Matches when: explicit 'path' strategy, OR no strategy and no generators
      const declared = appContext.routingStrategy;
      if (declared === 'path') return true;
      if (declared === undefined || declared === null) {
        // Only fallback if app has no custom generators
        return !appContext.generatePathFromContext || !appContext.extractContextIdFromPath;
      }
      return false;
    },

    encode(context: ContextItem | null, currentURL: URL): URL | null {
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
