/**
 * Custom error class for state-related operations.
 *
 * Extends the built-in Error class to provide specific error handling
 * for state management operations within the Fusion Framework.
 *
 * @example
 * ```typescript
 * throw new StateError('Failed to store item in state');
 * ```
 */
class StateError extends Error {
  /**
   * Creates a new StateError instance.
   *
   * @param message - Descriptive error message
   * @param options - Additional error options (cause, etc.)
   */
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = 'StateError';
  }
}

export default StateError;
