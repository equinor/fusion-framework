import { AssertionError } from 'node:assert';
import { assert } from './assert.js';
import { isGitDir } from './is-git-dir.js';

/**
 * Asserts that a directory exists and is a valid git repository.
 *
 * This function checks if the specified directory contains a valid
 * git repository by looking for the .git directory or file.
 *
 * @param dir - Directory path to check for git repository
 * @param message - Optional custom error message for assertion failure
 * @throws {AssertionError} If the directory is not a git repository
 *
 * @example
 * ```typescript
 * assertGitRepository('/path/to/git/repo'); // ✅ Passes if .git exists
 * assertGitRepository('/path/to/regular/dir'); // ❌ Throws AssertionError
 * ```
 */
export function assertGitRepository(dir: string, message?: string): void {
  assert(
    isGitDir(dir),
    new AssertionError({
      message: message ?? `Directory is not a git repository: ${dir}`,
      actual: dir,
      expected: '<git repository>',
    }),
  );
}
