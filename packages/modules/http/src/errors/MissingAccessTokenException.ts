import { HttpException } from './HttpException.js';

/**
 * Indicates that a scoped HTTP request was stopped before fetch because no MSAL access token
 * was available, including when the auth module is not registered.
 *
 * @example
 * ```ts
 * try {
 *   await client.json('/items', { scopes: ['api.read'] });
 * } catch (error) {
 *   if (MissingAccessTokenException.is(error)) {
 *     showSignInRequired();
 *   }
 *   throw error;
 * }
 * ```
 */
export class MissingAccessTokenException extends HttpException {
  /**
   * Identifies missing-token failures across application bundle boundaries.
   *
   * @param error - Unknown thrown value.
   * @returns Whether the value identifies a missing access token.
   */
  public static override is(error: unknown): error is MissingAccessTokenException {
    return (
      error instanceof MissingAccessTokenException ||
      (HttpException.is(error) && error.name === 'MissingAccessTokenException')
    );
  }

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
