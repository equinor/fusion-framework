/**
 * Error thrown when no accounts are available for an operation that requires one.
 *
 * Typically used when attempting to acquire a token or perform an action that requires
 * a user account, but none are found in the MSAL cache.
 *
 * @param message - Description of the error.
 * @param options - Optional error options, including a cause for error chaining.
 */
export class NoAccountsError extends Error {
  static readonly Name: string = 'NoAccountsError';

  /**
   * @param message - Description of the error.
   * @param options - Optional error options, including a cause for error chaining.
   */
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = NoAccountsError.Name;
  }
}
