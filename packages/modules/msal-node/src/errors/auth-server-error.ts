/**
 * Error representing a failure or issue in the authentication server flow.
 *
 * Used to signal problems during the OAuth 2.0 authorization code flow, such as
 * missing codes, invalid requests, or token exchange failures. Supports error chaining.
 *
 * @param message - Description of the error.
 * @param options - Optional error options, including a cause for error chaining.
 */
export class AuthServerError extends Error {
  static readonly Name: string = 'AuthServerError';

  /**
   * @param message - Description of the error.
   * @param options - Optional error options, including a cause for error chaining.
   */
  constructor(message: string, options?: { cause?: Error }) {
    super(message, options);
    this.name = AuthServerError.Name;
  }
}
