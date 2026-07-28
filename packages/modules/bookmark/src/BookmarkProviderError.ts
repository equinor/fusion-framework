/**
 * General-purpose error thrown by {@link BookmarkProvider} methods when a
 * high-level operation (create, update, delete, set current, etc.) fails.
 *
 * Distinct from {@link BookmarkFlowError}, which is scoped to internal
 * store flow pipelines.
 */
export class BookmarkProviderError extends Error {
  /**
   * Constructs a new `BookmarkProviderError`.
   *
   * @param message - Human-readable error message.
   * @param options - Optional `ErrorOptions` (e.g. `cause`).
   */
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = 'BookmarkProviderError';
  }
}
