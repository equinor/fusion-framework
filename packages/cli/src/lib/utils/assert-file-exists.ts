import { fileExists } from './file-exists-async.js';
import { assert } from './assert.js';

/**
 * Asserts that a file exists at the given path.
 *
 * This function uses the fileExists utility to check for file presence
 * and throws an AssertionError if the file is not found.
 *
 * @param value - The file path to check
 * @param message - Optional custom error message for assertion failure
 * @throws {AssertionError} If the file does not exist
 *
 * @example
 * ```typescript
 * assertFileExists('/path/to/file.txt'); // ✅ Passes if file exists
 * assertFileExists('/nonexistent/file.txt'); // ❌ Throws AssertionError
 * ```
 */
export const assertFileExists = (value: unknown, message?: string): asserts value => {
  // Use fileExists utility to check for file presence
  assert(fileExists(value as string), message ?? `file ${String(value)} does not exist`);
};
