import type { AccountInfo, AuthenticationResult, PublicClientApplication } from '@azure/msal-node';

import { AuthServerError, NoAccountsError, SilentTokenAcquisitionError } from './error.js';

import type { IAuthProvider } from './AuthProvider.interface.js';

/**
 * Implementation of the authentication provider for the Fusion MSAL Node module.
 *
 * Implements {@link IAuthProvider} and provides methods for managing authentication
 * and token acquisition using the MSAL (Microsoft Authentication Library) for Node.js.
 *
 * This implementation assumes the user is already logged in and does not support
 * triggering interactive login or logout flows. The `login` method will always throw, and `logout`
 * only clears the token cache.
 *
 * @see AuthProviderInteractive For interactive login/logout support (user-driven authentication flows).
 * @see AuthProviderTokenOnly For scenarios where a pre-obtained token is used (automation, CI/CD, etc).
 *
 * Developers extending this class can add support for additional authentication flows or modify token
 * acquisition logic. Ensure that any changes remain consistent with the interface contract.
 */
export class AuthProvider implements IAuthProvider {
  constructor(protected _client: PublicClientApplication) {}

  /**
   * Retrieves the first account from the list of all accounts available in the MSAL client.
   *
   * @returns A promise that resolves to the first `AccountInfo` object if available, or `null` if no accounts exist.
   */
  public async getAccount(): Promise<AccountInfo | null> {
    const accounts = await this._client.getAllAccounts();
    return accounts[0] ?? null;
  }

  /**
   * Acquires an access token for the specified scopes.
   *
   * @param options - An object containing the options for acquiring the token.
   * @param options.request.scopes - An array of strings representing the scopes for which the access token is requested.
   * @returns A promise that resolves to the acquired access token as a string.
   * @throws An error if the token acquisition process fails.
   */
  public async acquireAccessToken(options: { request: { scopes: string[] } }): Promise<string> {
    const { accessToken } = await this.acquireToken(options);
    return accessToken;
  }

  /**
   * Initiates the login process with the specified options.
   *
   * @param _options - An object containing the scopes required for authentication.
   * @returns A promise that resolves to an `AuthenticationResult` upon successful login.
   * @throws `AuthServerError` - Always throws this error as login is not supported in this implementation.
   *
   * @remarks
   * This method is not supported and is intended to be overridden by `AuthProviderInteractive`.
   */
  public async login(_options: { request: { scopes: string[] } }): Promise<AuthenticationResult> {
    throw new AuthServerError('Login not supported, use AuthProviderInteractive instead');
  }

  /**
   * Logs out the user by clearing the token cache and removing all accounts.
   *
   * This method retrieves all accounts from the token cache and removes them
   * individually. Afterward, it clears the entire cache to ensure no residual
   * authentication data remains.
   *
   * @returns A promise that resolves when the logout process is complete.
   */
  public async logout() {
    const cache = this._client.getTokenCache();
    const accounts = await cache.getAllAccounts();
    for (const account of accounts) {
      await cache.removeAccount(account);
    }
    this._client.clearCache();
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
  public async acquireToken(options: { request: { scopes: string[] } }): Promise<AuthenticationResult> {
    const account = await this.getAccount();
    if (!account) {
      throw new NoAccountsError('No accounts found in cache');
    }

    try {
      const tokenResponse = await this._client.acquireTokenSilent({
        scopes: options.request.scopes,
        account,
      });
      return tokenResponse;
    } catch (error) {
      throw new SilentTokenAcquisitionError('Error acquiring token', {
        cause: error,
      });
    }
  }
}
