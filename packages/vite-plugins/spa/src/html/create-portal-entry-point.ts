/**
 * Builds the portal template entrypoint URL used by the SPA bootstrap loader.
 *
 * @param segments - Ordered URL/path segments such as proxy prefix, asset path, and template entry.
 * @returns A normalized entrypoint string with single slashes between segments.
 */
export const createPortalEntryPoint = (...segments: Array<string | undefined | null>): string => {
  const normalized = segments
    // Drop undefined/null segments before further processing
    .filter((segment): segment is string => segment !== undefined && segment !== null)
    // Trim stray whitespace from each segment
    .map((segment) => segment.trim())
    // Drop any segments that became empty after trimming
    .filter(Boolean)
    // Strip leading slashes from every segment (and trailing slashes from the first)
    .map((segment, index) => {
      // The first segment may have a trailing slash (e.g. a base URL) that needs stripping
      if (index === 0) {
        return segment.replace(/\/+$/g, '');
      }
      return segment.replace(/^\/+|\/+$/g, '');
    });

  return normalized.join('/');
};
