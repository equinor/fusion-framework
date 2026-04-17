/**
 * Pure functions for extracting and generating context-id segments
 * from application-relative URL paths.
 *
 * Each routing strategy places the context id in a different position:
 * - **path**: first segment is a GUID  (`/:contextId/route-a`)
 * - **custom**: trailing segment after an optional route  (`/route-a/:contextId`)
 * - **query**: context id lives in `?$contextId=` — no path extraction needed
 *
 * @module context-path
 */

import { GUID_PATTERN, STATIC_ROUTES } from '../constants';

// ---------------------------------------------------------------------------
// Extractors – pull the context id OUT of a path
// ---------------------------------------------------------------------------

/**
 * Extracts the `$contextId` value from a URL search string.
 *
 * @param search - The raw search string (with or without a leading `?`)
 * @param key - Query parameter name to look for (default `$contextId`)
 * @returns The context id if present, otherwise `undefined`
 */
export const extractContextIdFromQuery = (
  search: string,
  key = '$contextId',
): string | undefined => {
  const params = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search);
  return params.get(key) ?? undefined;
};

/**
 * Extracts a context id from a path that uses the **custom** routing layout
 * where the context id appears as a trailing segment.
 *
 * Examples:
 * - `/abc-123`          → `'abc-123'`  (single non-route segment)
 * - `/route-a/abc-123`  → `'abc-123'`  (route prefix + context)
 * - `/route-a`          → `undefined`  (known route, no trailing id)
 *
 * @param path - Application-relative pathname
 * @returns The extracted context id, or `undefined` if none is found
 */
export const extractCustomContextIdFromPath = (path: string): string | undefined => {
  const segments = path.split('/').filter(Boolean);

  if (segments.length === 1) {
    return STATIC_ROUTES.has(segments[0]) ? undefined : segments[0];
  }

  if (segments.length === 2 && STATIC_ROUTES.has(segments[0])) {
    return segments[1];
  }

  return undefined;
};

/**
 * Extracts a context id from a path that uses the **path** routing strategy
 * where the first segment is expected to be a GUID.
 *
 * @param path - Application-relative pathname
 * @returns The GUID context id, or `undefined` if the first segment is not a GUID
 */
export const extractPathStrategyContextIdFromPath = (path: string): string | undefined => {
  const [firstSegment] = path.split('/').filter(Boolean);

  if (!firstSegment) {
    return undefined;
  }

  return GUID_PATTERN.test(firstSegment) ? firstSegment : undefined;
};

// ---------------------------------------------------------------------------
// Generators – produce a path WITH context id embedded
// ---------------------------------------------------------------------------

/**
 * Generates an application-relative path with the context id appended in
 * the **custom** layout (trailing segment).
 *
 * @param context - Object containing the context id
 * @param path - Current application-relative pathname
 * @returns The rewritten path, or `undefined` if the path shape is unexpected
 */
export const generateCustomPathFromContext = (
  context: { id: string },
  path: string,
): string | undefined => {
  const segments = path.split('/').filter(Boolean);

  if (segments.length === 0) {
    return `/${context.id}`;
  }

  if (segments.length === 1) {
    return STATIC_ROUTES.has(segments[0]) ? `/${segments[0]}/${context.id}` : `/${context.id}`;
  }

  if (segments.length === 2 && STATIC_ROUTES.has(segments[0])) {
    return `/${segments[0]}/${context.id}`;
  }

  return undefined;
};

/**
 * Resolves an application-relative path that places the context id as the
 * **first** segment (path strategy layout).
 *
 * @param pathname - Current application-relative pathname
 * @param contextId - The context id to embed
 * @returns A path with the context id prepended
 */
export const resolvePathFromContext = (pathname: string, contextId: string): string => {
  const normalizedPath = pathname === '' ? '/' : pathname;

  if (normalizedPath === '/') {
    return `/${contextId}`;
  }

  return `/${contextId}${normalizedPath.startsWith('/') ? normalizedPath : `/${normalizedPath}`}`;
};

/**
 * Resolves an application-relative path that places the context id as a
 * **trailing** segment (custom strategy layout).
 *
 * @param pathname - Current application-relative pathname
 * @param contextId - The context id to embed
 * @returns A path with the context id appended after the route prefix
 */
export const resolveCustomPathFromContext = (pathname: string, contextId: string): string => {
  const segments = pathname.split('/').filter(Boolean);

  if (segments.length === 0) {
    return `/${contextId}`;
  }

  if (segments.length === 1) {
    return STATIC_ROUTES.has(segments[0]) ? `/${segments[0]}/${contextId}` : `/${contextId}`;
  }

  if (segments.length === 2 && STATIC_ROUTES.has(segments[0])) {
    return `/${segments[0]}/${contextId}`;
  }

  return pathname;
};
