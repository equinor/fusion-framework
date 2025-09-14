import { resolve } from 'node:path';
import { rmSync } from 'node:fs';
import isPathInside from 'is-path-inside';

/**
 * Validates that a target path is safe for file system operations.
 *
 * Uses the well-established `is-path-inside` library to prevent path traversal attacks
 * by ensuring the target path is within expected bounds.
 *
 * @param targetPath - The path to validate
 * @param baseDir - The base directory that the target path should be within (optional)
 * @returns The resolved, validated path
 * @throws {Error} If the path is invalid or potentially dangerous
 *
 * @example
 * ```typescript
 * // Validate a user-provided path
 * const safePath = validateSafePath(userInput, process.cwd());
 *
 * // Validate a path without base directory constraint
 * const safePath = validateSafePath('/tmp/safe-directory');
 * ```
 */
export function validateSafePath(targetPath: string, baseDir?: string): string {
  if (typeof targetPath !== 'string' || targetPath.trim() === '') {
    throw new Error('Target path must be a non-empty string');
  }

  // Resolve the target path to get absolute path
  const resolvedPath = resolve(targetPath);

  // If baseDir is provided, ensure target path is within it using the established library
  if (baseDir) {
    const resolvedBaseDir = resolve(baseDir);

    if (!isPathInside(resolvedPath, resolvedBaseDir)) {
      throw new Error(
        'The target path must be within the current working directory. Please specify a relative path or ensure the absolute path is within the current directory.',
      );
    }
  }

  return resolvedPath;
}

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
