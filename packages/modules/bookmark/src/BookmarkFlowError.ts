import type { ActionWithSuffix } from '@equinor/fusion-observable';

import type { BookmarkActions } from './bookmark-actions';

/**
 * Error thrown inside bookmark store flows (side-effect pipelines) when an
 * API call or observable chain fails.
 *
 * Carries a reference to the originating request action so callers can
 * correlate errors back to specific operations.
 */
export class BookmarkFlowError extends Error {
  /**
   * Constructs a new `BookmarkFlowError`.
   *
   * @param message - Human-readable error message.
   * @param action - The request action that triggered the failed flow.
   * @param options - Optional `ErrorOptions` (e.g. `cause`).
   */
  constructor(
    message: string,
    /** The request action that triggered the failed flow. */
    public readonly action: ActionWithSuffix<BookmarkActions, 'request'>,
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.name = 'BookmarkProcessError';
  }
}

/**
 * General-purpose error thrown by {@link BookmarkProvider} methods when a
 * high-level operation (create, update, delete, set current, etc.) fails.
 *
 * Distinct from {@link BookmarkFlowError}, which is scoped to internal
 * store flow pipelines.
 */
export { BookmarkProviderError } from './BookmarkProviderError';
