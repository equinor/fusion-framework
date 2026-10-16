/**
 * Normalizes a pathname by:
 * - Collapsing multiple consecutive slashes into a single slash
 *
 * @example
 * normalizePathname("/app//users///profile/") // returns "/app/users/profile/"
 * normalizePathname("///multiple///slashes///") // returns "/multiple/slashes/"
 *
 * @param path - The pathname to normalize
 * @returns The normalized pathname without consecutive slashes
 */
export const normalizePathname = (path: string): string => {
  // Use iterative approach instead of regex to avoid potential ReDoS with untrusted input
  let result = '';
  let lastWasSlash = false;

  // Walk each character once to collapse runs of slashes in a single pass
  for (let i = 0; i < path.length; i++) {
    const char = path[i];
    // Only slashes need de-duplication; every other character passes through
    if (char === '/') {
      // Keep the first slash of a run, drop the rest
      if (!lastWasSlash) {
        result += char;
        lastWasSlash = true;
      }
      // Skip consecutive slashes
    } else {
      result += char;
      lastWasSlash = false;
    }
  }

  return result;
};
