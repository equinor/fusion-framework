import type { ActionWithSuffix } from '@equinor/fusion-observable';
import deepEqual from 'fast-deep-equal/es6/index.js';

import type { BookmarkActions } from './bookmark-actions.js';

/**
 * Error thrown inside bookmark store flows (side-effect pipelines) when an
 * API call or observable chain fails.
 *
 * Carries a reference to the originating request action so callers can
 * correlate errors back to specific operations.
 */
export class BookmarkFlowError extends Error {
  /** Stable discriminator shared by bookmark flow errors across runtime scopes. */
  public static readonly Type = 'BookmarkFlowError' as const;

  /** Identifies failures originating from a bookmark flow across separate bundles. */
  public readonly type = BookmarkFlowError.Type;

  /**
   * Narrows an unknown failure to a bookmark flow error.
   * @param error - The failure to identify.
   * @returns Whether the value is a bookmark flow error.
   * @example
   * ```ts
   * if (BookmarkFlowError.is(error)) console.error(error.action);
   * ```
   */
  public static is(error: unknown): error is BookmarkFlowError {
    // Separate host and application bundles can contain distinct copies of this class.
    if (typeof error !== 'object' || error === null) {
      return false;
    }
    const candidate = error as Record<PropertyKey, unknown>;
    return (
      candidate.type === BookmarkFlowError.Type &&
      typeof candidate.name === 'string' &&
      typeof candidate.message === 'string'
    );
  }

  /**
   * Compares errors by message, name, own fields, and nested causes, ignoring stack traces.
   * Accepts native errors so the same comparison applies throughout the cause chain.
   * @param left - The previously observed error.
   * @param right - The current error.
   * @returns Whether both errors describe the same failure.
   * @example
   * ```ts
   * const unchanged = BookmarkFlowError.compare(previousError, currentError);
   * ```
   */
  public static compare(left: Error, right: Error): boolean {
    // Error details are non-enumerable; compare them explicitly rather than by identity.
    const equalCauses =
      left.cause instanceof Error && right.cause instanceof Error
        ? BookmarkFlowError.compare(left.cause, right.cause)
        : deepEqual(left.cause, right.cause);

    return (
      left.name === right.name &&
      left.message === right.message &&
      equalCauses &&
      deepEqual({ ...left, cause: undefined }, { ...right, cause: undefined })
    );
  }

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
export { BookmarkProviderError } from './BookmarkProviderError.js';
