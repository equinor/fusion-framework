/**
 * Error thrown when a file exists but cannot be accessed (e.g. EACCES or EISDIR).
 *
 * Thrown by {@link processAccessError} for permission or path-type errors.
 * Callers can use `instanceof FileNotAccessibleError` to distinguish
 * access failures from missing-file failures.
 */
export class FileNotAccessibleError extends Error {
  /**
   * @param message - Human-readable description of the access failure.
   * @param options - Standard `ErrorOptions`, typically `{ cause: originalError }`.
   */
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = 'FileNotAccessibleError';
  }
}
