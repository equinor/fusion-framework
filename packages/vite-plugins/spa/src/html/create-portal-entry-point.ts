/**
 * Builds the portal template entrypoint URL used by the SPA bootstrap loader.
 *
 * @param segments - Ordered URL/path segments such as proxy prefix, asset path, and template entry.
 * @returns A normalized entrypoint string with single slashes between segments.
 */
export const createPortalEntryPoint = (...segments: Array<string | undefined | null>): string => {
  const normalized = segments
    .filter((segment): segment is string => segment !== undefined && segment !== null)
    .map((segment) => segment.trim())
    .filter(Boolean)
    .map((segment, index) => {
      if (index === 0) {
        return segment.replace(/\/+$/g, '');
      }
      return segment.replace(/^\/+|\/+$/g, '');
    });

  return normalized.join('/');
};
