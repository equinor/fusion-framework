import { rmSync } from 'node:fs';
import { validateSafePath } from './validate-safe-path.js';

/**
 * Safely removes a directory with path traversal protection.
 *
 * This function validates the target path before performing the removal
 * operation to prevent accidental deletion of unintended directories.
 *
 * @param targetPath - The path to remove
 * @param options - rmSync options
 * @param baseDir - Optional base directory constraint
 * @throws {Error} If path validation fails or removal operation fails
 */
export function safeRmSync(
  targetPath: string,
  options: { recursive: boolean; force: boolean },
  baseDir?: string,
): void {
  // Validate the path before removal
  const safePath = validateSafePath(targetPath, baseDir);

  // Perform the removal operation
  rmSync(safePath, options);
}
