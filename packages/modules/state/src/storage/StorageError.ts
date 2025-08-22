/**
 * Represents an error that occurs during storage operations.
 *
 * Extends the native `Error` class to provide a specific error type for storage-related issues.
 *
 * @example
 * ```typescript
 * throw new StorageError('Failed to save data', { cause: originalError });
 * ```
 *
 * @param message - A descriptive error message.
 * @param options - Additional error options, such as a cause.
 */
export class StorageError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = 'StorageError';
  }
}

export default StorageError;
