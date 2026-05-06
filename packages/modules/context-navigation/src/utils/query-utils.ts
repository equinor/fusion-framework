import { splitRelativePath } from './path-utils';

/** Query-parameter key for context id in query-routing mode. */
export const CONTEXT_QUERY_PARAM_KEY = '$contextId';

/** Serializes URLSearchParams keeping `$contextId` as a literal unencoded key. */
const serializeQueryKeepingCtxReadable = (params: URLSearchParams): string =>
  Array.from(params.entries())
    .map(([key, value]) => {
      const encodedKey =
        key === CONTEXT_QUERY_PARAM_KEY ? CONTEXT_QUERY_PARAM_KEY : encodeURIComponent(key);
      return `${encodedKey}=${encodeURIComponent(value)}`;
    })
    .join('&');

/** Writes context id to `$contextId` query param, or removes it when undefined. */
export const writeContextIdToQueryParam = (path: string, contextId?: string): string => {
  const { pathname, search, hash } = splitRelativePath(path);
  const params = new URLSearchParams(search);

  if (contextId) {
    params.set(CONTEXT_QUERY_PARAM_KEY, contextId);
  } else {
    params.delete(CONTEXT_QUERY_PARAM_KEY);
  }

  const nextSearch = serializeQueryKeepingCtxReadable(params);
  return `${pathname}${nextSearch ? `?${nextSearch}` : ''}${hash ? `#${hash}` : ''}`;
};

/** Reads `$contextId` query parameter value from a relative URL. */
export const readContextIdFromQueryParam = (path: string): string | undefined => {
  const { search } = splitRelativePath(path);
  return new URLSearchParams(search).get(CONTEXT_QUERY_PARAM_KEY) ?? undefined;
};
