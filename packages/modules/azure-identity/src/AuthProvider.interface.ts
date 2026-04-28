/**
 * Interface for authentication providers in the Fusion Framework.
 *
 * Provides a minimal contract for acquiring access tokens. Implementations may
 * support login/logout (interactive flows) or throw if those operations are not
 * applicable to the credential type.
 */
export interface IAuthProvider {
  /**
   * Initiates a login flow. Not supported by all credential types — implementations
   * that do not support user interaction should throw.
   */
  login(options: { request: { scopes: string[] } }): Promise<unknown>;

  /**
   * Clears any cached session. Not supported by all credential types — implementations
   * that have no session state should throw.
   */
  logout(): Promise<void>;

  /**
   * Acquires an access token for the specified scopes.
   *
   * @param options - The scopes to request.
   * @returns The access token string.
   */
  acquireAccessToken(options: {
    request: { scopes: string[] };
    interactive?: boolean;
  }): Promise<string>;
}
