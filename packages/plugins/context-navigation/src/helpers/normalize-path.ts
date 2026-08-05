/**
 * Normalizes a path string to ensure it is in a consistent format for comparison and processing.
 *
 * This function performs the following normalizations:
 * - Ensures the path starts with a leading slash.
 * - Removes any trailing slashes, except for the root path ("/").
 * - Converts empty paths to the root path ("/").
 * - Fixing multiple consecutive slashes to a single slash.
 *
 * @param path - The path string to normalize.
 * @returns The normalized path string.
 */
export function normalizePath(path: string): string {
  // Replace multiple consecutive slashes with a single slash
  path = path.replace(/\/+/g, '/');

  // Ensure the path starts with a leading slash
  if (!path.startsWith('/')) {
    path = `/${path}`;
  }

  // Remove trailing slashes, except for the root path
  if (path.length > 1 && path.endsWith('/')) {
    path = path.slice(0, -1);
  }

  // Convert empty paths to the root path
  if (path === '') {
    return '/';
  }

  return path;
}
