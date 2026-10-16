import path from 'node:path';

/**
 * Checks whether `file` is `directory` or inside it.
 *
 * @param directory - Absolute directory.
 * @param file - Absolute path.
 * @returns `true` when `file` is within `directory`.
 */
export function isInsideDirectory(directory: string, file: string): boolean {
  const relative = path.relative(directory, file);
  return relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative));
}
