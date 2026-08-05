/**
 * Builds `/apps/:appKey[/:contextId][/:rest]` from named segments.
 * Inverse of `parseAppRoute` — used by all write/upsert helpers.
 *
 * @param appKey - The application key (e.g. `'my-app'`).
 * @param contextId - Optional context id to embed as the third path segment.
 * @param rest - Optional sub-route tail to append after the context segment.
 * @returns The constructed app route path string.
 */
export const buildAppRoute = (appKey: string, contextId?: string, rest?: string): string => {
  const path = [`/apps/${appKey}`];

  // Context segment is optional — omitted when no context is actively selected
  if (contextId) path.push(`${contextId}`);

  // Preserve any sub-route depth that exists beyond the context segment
  if (rest) path.push(`${rest}`);

  return path.join('/');
};
