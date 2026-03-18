/**
 * Error thrown by AI service implementations when a service-level operation fails.
 *
 * Wraps the underlying provider error as `cause` so the full chain is preserved.
 *
 * @example
 * ```typescript
 * throw new ServiceError('Azure OpenAI embedding request failed', { cause: originalError });
 * ```
 */
export class ServiceError extends Error {
  /**
   * @param message - Human-readable description of the failure.
   * @param options - Standard `ErrorOptions`; use `cause` to attach the original error.
   */
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = 'ServiceError';
  }
}
