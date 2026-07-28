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
  /**
   * @param message - Human-readable description of the missing file.
   * @param options - Standard `ErrorOptions`, typically `{ cause: originalError }`.
   */
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = 'FileNotFoundError';
  }
}
