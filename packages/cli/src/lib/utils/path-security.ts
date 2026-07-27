import { resolve } from 'node:path';
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
 * // Validate a user-provided path within a specific directory
 * const safePath = validateSafePath(userInput, '/path/to/base/directory');
 *
 * // Validate a path without base directory constraint
 * const safePath = validateSafePath('/tmp/safe-directory');
 * ```
 */
export function validateSafePath(targetPath: string, baseDir?: string): string {
  // Reject blank/whitespace-only input before attempting to resolve it
  if (typeof targetPath !== 'string' || targetPath.trim() === '') {
    throw new Error('Target path must be a non-empty string');
  }

  // Resolve the target path to get absolute path
  const resolvedPath = resolve(targetPath);

  // If baseDir is provided, ensure target path is within it using the established library
  if (baseDir) {
    const resolvedBaseDir = resolve(baseDir);

    // Reject any path that escapes the configured base directory
    if (!isPathInside(resolvedPath, resolvedBaseDir)) {
      throw new Error(
        'The target path must be within the specified base directory. Please specify a relative path or ensure the absolute path is within the base directory.',
      );
    }
  }

  return resolvedPath;
}

