/**
 * Structured error class for AI module operations.
 *
 * Extends the standard `Error` with machine-readable fields that allow
 * callers to inspect error origin, HTTP status, and arbitrary provider
 * details without parsing the message string.
 *
 * @example
 * ```typescript
 * throw new AIError(
 *   'Azure Vector Store search failed',
 *   'SEARCH_ERROR',
 *   503,
 *   { index: 'documents' },
 * );
 * ```
 */
export class AIError extends Error {
  /**
   * Create an AI-specific error.
   *
   * @param message - Human-readable description of the error.
   * @param code - Machine-readable error code (e.g. `'SEARCH_ERROR'`, `'INITIALIZATION_ERROR'`).
   * @param statusCode - HTTP status code when the error originates from a remote service.
   * @param details - Provider-specific metadata attached to the error.
   */
  constructor(
    message: string,
    public readonly code?: string,
    public readonly statusCode?: number,
    public readonly details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = 'AIError';
  }
}
