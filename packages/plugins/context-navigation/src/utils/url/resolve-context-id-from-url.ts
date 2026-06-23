import { UUID_PATTERN, CONTEXT_QUERY_PARAM_KEY } from '../../constants';
import { parseAppRoute } from './parse-app-route';

/**
 * Extracts a context id from a URL — checks query param first, falls back to path segment.
 * Designed for use with `setContextPathExtractor`.
 * @param path - The URL path to parse.
 * @returns The context id, or `undefined` if none was found.
 */
export const resolveContextIdFromUrl = (path: string): string | undefined => {
  try {
    const url = new URL(path, 'http://localhost');
    const fromQuery = url.searchParams.get(CONTEXT_QUERY_PARAM_KEY) ?? undefined;

    // Query params are the explicit/authoritative way to set context — path is a fallback
    if (fromQuery) {
      return fromQuery;
    }
  } catch {
    // path may not be a valid URL — continue to path parsing
  }

  // Context may be embedded in the path when no query param is present
  const match = parseAppRoute(path);

  // Guard against non-context path segments — parseAppRoute can match non-UUID routes
  if (match?.contextId && UUID_PATTERN.test(match.contextId)) {
    return match.contextId;
  }

  return undefined;
};
