import type { ContextItem } from '@equinor/fusion-framework-module-context';
import type { ContextRoutingStrategy } from '../types';

const CONTEXT_QUERY_PARAM = '$contextId';

/**
 * Query strategy — context id stored as `?$contextId=...` query parameter.
 *
 * The URL path is never modified. This is the recommended strategy for
 * new apps — clean separation between routing and context identity.
 */
export const queryStrategy: ContextRoutingStrategy = {
  id: 'query',

  encode(context: ContextItem | null, currentURL: URL): URL | null {
    const url = new URL(currentURL.href);
    if (context === null) {
      url.searchParams.delete(CONTEXT_QUERY_PARAM);
    } else {
      url.searchParams.set(CONTEXT_QUERY_PARAM, context.id);
    }
    return url;
  },

  decode(url: URL): string | null {
    return url.searchParams.get(CONTEXT_QUERY_PARAM);
  },
};
