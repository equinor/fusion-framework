/**
 * Decides whether a file-system error means "nothing exists at this path".
 *
 * Only `ENOENT` and `ENOTDIR` qualify. Permission, I/O and other errors mean the
 * path may exist but could not be read, so callers must report them instead of
 * treating the path as absent.
 *
 * @param error - Value thrown by a `node:fs` call.
 * @returns `true` for missing-path errors.
 */
export function isMissingFileError(error: unknown): boolean {
  const code = error instanceof Error && 'code' in error ? error.code : undefined;
  return code === 'ENOENT' || code === 'ENOTDIR';
}
