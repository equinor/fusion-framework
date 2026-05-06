import type { ContextItem } from '@equinor/fusion-framework-module-context';
import type { ContextRoutingStrategy } from '../types';

/**
 * Path strategy — context id as 3rd URL path segment.
 *
 * URL shape: `/apps/{appKey}/{contextId}/sub-route`
 *
 * Preserves sub-routes beyond the context segment on context change.
 * Removes the context segment entirely when context is cleared.
 */
export const pathStrategy: ContextRoutingStrategy = {
  id: 'path',

  encode(context: ContextItem | null, currentURL: URL): URL | null {
    const segments = currentURL.pathname.split('/').filter(Boolean);

    // Expected shape: ['apps', appKey, contextId?, ...rest]
    // Minimum: ['apps', appKey]
    if (segments.length < 2) {
      return null;
    }

    const appKey = segments[1];

    if (context === null) {
      // Clear: navigate to app root
      const url = new URL(`/apps/${appKey}/`, currentURL.origin);
      url.search = currentURL.search;
      return url;
    }

    // Determine sub-routes: everything after position 2 (the context slot)
    const existingContextId = isGuid(segments[2]) ? segments[2] : undefined;
    const subRoutes = existingContextId ? segments.slice(3) : segments.slice(2);
    const suffix = subRoutes.length > 0 ? `/${subRoutes.join('/')}/` : '/';

    const url = new URL(`/apps/${appKey}/${context.id}${suffix}`, currentURL.origin);
    url.search = currentURL.search;
    return url;
  },

  decode(url: URL): string | null {
    const segments = url.pathname.split('/').filter(Boolean);
    // Expected: ['apps', appKey, contextId, ...rest]
    const candidate = segments[2];
    return candidate && isGuid(candidate) ? candidate : null;
  },
};

/** Simple GUID check — matches UUID v4 and similar formats. */
function isGuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}
