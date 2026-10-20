/**
 * Indicates that a scoped HTTP request was stopped before fetch because no MSAL access token
 * was available, including when the auth module is not registered.
 *
 * @example
 * ```ts
 * try {
 *   await client.json('/items', { scopes: ['api.read'] });
 * } catch (error) {
 *   if (error instanceof MissingAccessTokenException) {
 *     showSignInRequired();
 *   }
 *   throw error;
 * }
 * ```
 */
export class MissingAccessTokenException extends Error {
  /**
   * Creates an authentication failure for a request that must not be sent anonymously.
   *
   * @param message - Explains which scoped request could not acquire a token.
   * @param options - Standard error options, including an optional cause.
   */
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = 'MissingAccessTokenException';
  }
}
