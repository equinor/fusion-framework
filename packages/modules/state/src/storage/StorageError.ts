/**
 * Represents an error that occurs during storage operations.
 *
 * Extends the native `Error` class to provide a specific error type for storage-related issues
 * with additional context information.
 *
 * @example
 * ```typescript
 * throw new StorageError('Failed to save data', {
 *   cause: originalError,
 *   context: { docId: '123', operation: 'save' }
 * });
 * ```
 */
export interface StorageErrorOptions extends ErrorOptions {
  /** Additional context information about the error */
  context?: Record<string, unknown>;
}

/** Represents a storage operation failure with optional contextual metadata. */
export class StorageError extends Error {
  /** Additional context information about the error */
  public readonly context?: Record<string, unknown>;

  /**
   * Creates a storage error.
   * @param message - Human-readable failure message.
   * @param options - Optional cause and contextual metadata.
   */
  constructor(message: string, options?: StorageErrorOptions) {
    super(message, options);
    this.name = 'StorageError';
    this.context = options?.context;
  }
}

export default StorageError;
