/**
 * Error thrown when a file cannot be found on disk (e.g. ENOENT).
 *
 * Thrown by {@link processAccessError} when the underlying `fs` error code is
 * `ENOENT`. Callers can use `instanceof FileNotFoundError` to distinguish
 * "missing" from "permission denied" failures.
 *
 * @example
 * ```typescript
 * try {
 *   await resolveConfigFile('app.config');
 * } catch (error) {
 *   if (error instanceof FileNotFoundError) {
 *     console.error('Config file does not exist');
 *   }
 * }
 * ```
 */
export class FileNotFoundError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = 'FileNotFoundError';
  }
}

/**
 * Error thrown when a file exists but cannot be accessed (e.g. EACCES or EISDIR).
 *
 * Thrown by {@link processAccessError} for permission or path-type errors.
 * Callers can use `instanceof FileNotAccessibleError` to distinguish
 * access failures from missing-file failures.
 */
export class FileNotAccessibleError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = 'FileNotAccessibleError';
  }
}

/**
 * Converts a raw `fs` access error into a typed {@link FileNotFoundError},
 * {@link FileNotAccessibleError}, or generic `Error` based on the errno code.
 *
 * @param error - The caught error, typically a `NodeJS.ErrnoException`.
 * @param path  - Absolute or relative file path that triggered the error.
 * @returns A typed error instance with the original error set as `cause`.
 */
export const processAccessError = (error: unknown, path: string): Error => {
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
