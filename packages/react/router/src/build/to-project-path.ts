import path from 'node:path';

/**
 * Converts an absolute file path to a normalized project-relative path with `/`
 * separators, or `null` when the file is outside the project root.
 *
 * Project-relative paths are the basis of route IDs, so they must not depend on
 * the machine, the platform separator or the process working directory.
 *
 * @param root - Absolute project root.
 * @param file - Absolute file path.
 * @param pathApi - Platform path implementation; injectable so Windows paths can be tested on POSIX.
 * @returns The project-relative path, or `null` when `file` escapes `root`.
 */
export function toProjectPath(
  root: string,
  file: string,
  pathApi: Pick<typeof path, 'relative' | 'isAbsolute' | 'sep'> = path,
): string | null {
  const relative = pathApi.relative(root, file);
  // An escaping or cross-drive path would produce a machine-specific ID, so it is rejected
  if (relative === '' || relative.startsWith('..') || pathApi.isAbsolute(relative)) {
    return null;
  }
  return relative.split(pathApi.sep).join('/');
}
