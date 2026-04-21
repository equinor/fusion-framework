/**
 * Builds the portal template entrypoint URL used by the SPA bootstrap loader.
 *
 * @param segments - Ordered URL/path segments such as proxy prefix, asset path, and template entry.
 * @returns A normalized entrypoint string with single slashes between segments.
 */
export const createPortalEntryPoint = (...segments: Array<string | undefined | null>): string => {
  const normalized = segments
    .filter((segment): segment is string => Boolean(segment))
    .map((segment, index) => {
      const value = segment.trim();
      if (index === 0) {
        return value.replace(/\/+$/g, '');
      }
      return value.replace(/^\/+|\/+$/g, '');
    })
    .filter(Boolean);

  return normalized.join('/');
};
