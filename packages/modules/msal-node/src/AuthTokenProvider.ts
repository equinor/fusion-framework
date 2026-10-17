import type { AuthenticationResult } from '@azure/msal-node';
import { BaseModuleProvider } from '@equinor/fusion-framework-module/provider';
import type { IAuthProvider } from './AuthProvider.interface.js';
import { version } from './version.js';

/**
 * Implementation of an authentication provider that supplies a static, pre-obtained access token.
 *
 * This class implements {@link IAuthProvider} and is intended for scenarios where authentication
 * is handled externally and a token is provided directly (e.g., CI/CD pipelines, automation, or service accounts).
 *
 * Login and logout operations are not supported and will always throw errors if called.
 *
 * Extends {@link BaseModuleProvider} so the module configurator recognises it as a standard
 * provider and can report the package `version`.
 *
 * @see AuthProvider for silent authentication using cached accounts and MSAL flows.
 * @see AuthProviderInteractive for interactive, user-driven authentication flows.
 */
export class AuthTokenProvider extends BaseModuleProvider<undefined> implements IAuthProvider {
  #accessToken: string;

  /**
   * Creates a provider that serves the given token for every request.
   *
   * @param token - The pre-obtained access token to serve for all token requests.
   */
  constructor(token: string) {
    // The token is kept private rather than passed as `config` so it is never exposed via the base class.
    super({ version, config: undefined });
    this.#accessToken = token;
  }

  /**
   * Not supported in token-only mode. Always throws an error if called.
   *
   * This provider is designed for scenarios where authentication is handled externally
   * and a static token is supplied. Login flows are not possible in this context.
   *
   * @param _options - Unused; login is not supported in token-only mode.
   * @returns Never resolves; always throws.
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
