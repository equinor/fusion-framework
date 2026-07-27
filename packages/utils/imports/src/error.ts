import { FileNotAccessibleError } from './errors/file-not-accessible-error.js';
import { FileNotFoundError } from './errors/file-not-found-error.js';

/**
 * Converts a raw `fs` access error into a typed {@link FileNotFoundError},
 * {@link FileNotAccessibleError}, or generic `Error` based on the errno code.
 *
 * @param error - The caught error, typically a `NodeJS.ErrnoException`.
 * @param path  - Absolute or relative file path that triggered the error.
 * @returns A typed error instance with the original error set as `cause`.
 */
export const processAccessError = (error: unknown, path: string): Error => {
  // Dispatch to the typed error matching the underlying errno code
  switch ((error as NodeJS.ErrnoException).code) {
    case 'ENOENT':
      return new FileNotFoundError(`File not found: ${path}`, { cause: error });
    case 'EISDIR':
      return new FileNotAccessibleError(`Path is a directory: ${path}`, { cause: error });
    case 'EACCES':
      return new FileNotAccessibleError(`File not accessible: ${path}`, { cause: error });
    default:
      return new Error(`Unknown error accessing: ${path}`, { cause: error });
  }
};
