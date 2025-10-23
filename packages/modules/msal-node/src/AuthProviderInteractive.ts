import {
  CryptoProvider,
  type AuthenticationResult,
  type PublicClientApplication,
} from '@azure/msal-node';

import openBrowser from 'open';
import { createAuthServer } from './create-auth-server.js';
import { AuthProvider } from './AuthProvider.js';

/**
 * Options for configuring the interactive authentication provider.
 *
 * @property server - Configuration for the local server used to handle authentication callbacks.
 *   @property port - The port number on which the local server will listen for authentication responses.
 *   @property onOpen - Optional callback invoked with the authentication URL when the server is ready (e.g., to display or log the URL).
 *
 * Used when constructing an instance of {@link AuthProviderInteractive} to enable browser-based login flows.
 */
type AuthProviderOptions = {
  server: {
    port: number;
    onOpen?: (url: string) => void;
  };
};

/**
 * Implementation of an interactive authentication provider for the Fusion MSAL Node module.
 *
 * Extends {@link AuthProvider} to support user-driven authentication flows using the authorization code flow with PKCE.
 * This class opens the user's default browser for authentication and handles the response via a local server.
 *
 * This implementation is intended for scenarios where interactive login is required, such as CLI tools or development utilities.
 *
 * Developers extending this provider can customize the interactive flow, server handling, or PKCE logic as needed.
 * Ensure that any changes remain consistent with the expected interface and security best practices.
 *
 * @see AuthProvider for non-interactive (silent) authentication flows.
 * @see AuthProviderTokenOnly for token-only scenarios.
 */
export class AuthProviderInteractive extends AuthProvider {
  #options: AuthProviderOptions;

  constructor(client: PublicClientApplication, options: AuthProviderOptions) {
    super(client);
    this.#options = options;
  }

  /**
   * Initiates the login process using the authorization code flow with PKCE.
   *
   * This method generates a PKCE code verifier and challenge to enhance security
   * and prevent authorization code interception attacks. It constructs an
   * authorization code URL, opens the default browser for user authentication,
   * and starts a local server to handle the authentication response.
   *
   * @param scopes - An array of scopes that specify the permissions being requested.
   * @returns A promise that resolves to an `AuthenticationResult` containing the
   *          authentication details upon successful login.
   *
   * @throws Will throw an error if the PKCE code generation, browser opening, or
   *         authentication server setup fails.
   */
  public async login(options: { request: { scopes: string[] } }): Promise<AuthenticationResult> {
    const { scopes } = options.request;
    const { port, onOpen } = this.#options.server;

    // Generate a new PKCE code verifier and challenge
    // This is used to enhance security in the authorization code flow
    // by preventing authorization code interception attacks.
    const cryptoProvider = new CryptoProvider();
    const { verifier, challenge } = await cryptoProvider.generatePkceCodes();
    const authCodeUrl = await this._client.getAuthCodeUrl({
      scopes,
      redirectUri: `http://localhost:${port}`,
      codeChallenge: challenge,
      codeChallengeMethod: 'S256',
    });

    // open default browser to authenticate
    await openBrowser(authCodeUrl);

    // callback to open the auth code url
    if (onOpen) onOpen(authCodeUrl);

    return createAuthServer(this._client, scopes, {
      codeVerifier: verifier,
      port,
    });
  }

  /**
   * Acquires an authentication token for the specified scopes.
   *
   * This method first attempts to acquire a token silently using the accounts
   * available in the token cache. If no accounts are found and interactive login
   * is allowed, it initiates an interactive login flow. If interactive login is
   * not allowed and no accounts are found, an error is thrown.
   *
   * @param scopes - An array of strings representing the scopes for which the token is requested.
   * @param options - Optional parameters for token acquisition.
   * @param options.interactive - A boolean indicating whether interactive login is allowed
   *                               if no accounts are found in the cache. Defaults to `false`.
   * @returns A promise that resolves to an `AuthenticationResult` containing the acquired token.
   * @throws {@link NoAccountsError} If no accounts are found in the cache and interactive login is not allowed.
   * @throws {@link SilentTokenAcquisitionError} If an error occurs during silent token acquisition.
   */
  public async acquireToken(options: {
    request: { scopes: string[] };
  }): Promise<AuthenticationResult> {
    const { scopes } = options.request ?? { scopes: [] };
    if ((await this.getAccount()) === null) {
      return this.login({ request: { scopes } });
    }
    return super.acquireToken(options);
  }
}
