import type { AuthenticationResult } from '@azure/msal-node';
import type { IAuthProvider } from './AuthProvider.interface.js';

/**
 * Implementation of an authentication provider that supplies a static, pre-obtained access token.
 *
 * This class implements {@link IAuthProvider} and is intended for scenarios where authentication
 * is handled externally and a token is provided directly (e.g., CI/CD pipelines, automation, or service accounts).
 *
 * Login and logout operations are not supported and will always throw errors if called.
 *
 * @see AuthProvider for silent authentication using cached accounts and MSAL flows.
 * @see AuthProviderInteractive for interactive, user-driven authentication flows.
 */
export class AuthTokenProvider implements IAuthProvider {
  #accessToken: string;
  constructor(token: string) {
    this.#accessToken = token;
  }

  /**
   * Not supported in token-only mode. Always throws an error if called.
   *
   * This provider is designed for scenarios where authentication is handled externally
   * and a static token is supplied. Login flows are not possible in this context.
   *
   * @throws Error Always throws to indicate login is not supported.
   */
  login(_options: { request: { scopes: string[] } }): Promise<AuthenticationResult> {
    throw new Error('Method not supported in token mode');
  }

  /**
   * Not supported in token-only mode. Always throws an error if called.
   *
   * Since this provider does not manage user sessions or accounts, logout is not applicable.
   *
   * @throws Error Always throws to indicate logout is not supported.
   */
  logout(): Promise<void> {
    throw new Error('Method not supported in token mode');
  }

  /**
   * Returns the pre-obtained access token supplied to the provider.
   *
   * This is the only supported operation for this provider. No token refresh or acquisition logic is performed.
   *
   * @param _options - Options parameter (ignored in token-only mode)
   * @returns The static access token as a string.
   */
  async acquireAccessToken(_options: { request: { scopes: string[] } }): Promise<string> {
    return this.#accessToken;
  }
}

export default AuthTokenProvider;
