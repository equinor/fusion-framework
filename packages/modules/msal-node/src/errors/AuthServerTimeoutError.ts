import { AuthServerError } from './AuthServerError.js';

/**
 * Error thrown when the authentication server times out waiting for a response.
 *
 * Extends {@link AuthServerError} to provide additional context for timeout scenarios.
 *
 * @param message - Description of the error.
 * @param options - Optional error options, including a cause for error chaining.
 */
export class AuthServerTimeoutError extends AuthServerError {
  static readonly Name: string = 'AuthServerTimeoutError';

  /**
   * @param message - Description of the error.
   * @param options - Optional error options, including a cause for error chaining.
   */
  constructor(message: string, options?: { cause?: Error }) {
    super(message, options);
    this.name = AuthServerTimeoutError.Name;
  }
}
