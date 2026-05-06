import type { ContextItem } from '@equinor/fusion-framework-module-context';
import type { ContextNavigationAdapter, AdapterResolutionContext } from '../types';

const DEFAULT_PARAM = 'contextId';

/**
 * Query adapter — encodes context ID as a query parameter.
 *
 * URL shape: `/apps/{appKey}/...?contextId={id}`
 *
 * Matches apps that declare `routingStrategy: 'query'`.
 */
export function createQueryAdapter(paramName = DEFAULT_PARAM): ContextNavigationAdapter {
  return {
    id: 'query',

    canHandle({ appContext }: AdapterResolutionContext): boolean {
      return appContext.routingStrategy === 'query';
    },

    encode(context: ContextItem | null, currentURL: URL): URL | null {
      const url = new URL(currentURL.href);

      if (context === null) {
        url.searchParams.delete(paramName);
      } else {
        url.searchParams.set(paramName, context.id);
      }

      return url;
    },

    decode(url: URL): string | null {
      return url.searchParams.get(paramName) ?? null;
    },
  };
}
