/**
 * Removes trailing slashes from a path string.
 *
 * @param path - The path to trim
 * @returns The path without trailing slashes
 *
 * @example
 * stripTrailingSlashes("/apps/my-app/") // returns "/apps/my-app"
 * stripTrailingSlashes("/apps/my-app///") // returns "/apps/my-app"
 */
export const stripTrailingSlashes = (path: string): string => {
  // Use iterative approach to avoid ReDoS vulnerability
  let endIndex = path.length;
  // Shrink endIndex past every trailing slash
  while (endIndex > 0 && path[endIndex - 1] === '/') {
    endIndex--;
  }
  return path.substring(0, endIndex);
};
