import type { AuthenticationResult } from '@azure/msal-node';

/**
 * Interface for authentication providers in the Fusion MSAL Node module.
 *
 * Provides a unified API for authentication operations, including acquiring access tokens.
 * The actual behavior of each method depends on the configured authentication mode (interactive, silent, or token-only).
 *
 * When accessing `appModules.msal.auth`, you will interact with this interface to:
 * - Acquire Azure AD access tokens for specified scopes
 *
 * All methods are asynchronous and return Promises. See method documentation for details.
 *
 * @remarks
 * This provider assumes the user is already logged in. To support login and logout operations, the module must be configured in interactive mode. In other modes, `login` and `logout` are present for compatibility but will be no-ops or throw if called.
 *
 * @see IAuthProviderInteractive for interactive login/logout support
 */
export interface IAuthProvider {
  /**
   * This method is present for compatibility but will never trigger a user login flow unless interactive mode is configured.
   *
   * @param options - An object specifying the required scopes for authentication.
   * @returns A Promise that will always reject or be a no-op, depending on implementation.
   *
   * @remarks
   * This method is not supported and should not be used to initiate login unless interactive mode is enabled.
   */
  login(options: { request: { scopes: string[] } }): Promise<AuthenticationResult>;

  /**
   * This method is present for compatibility but will never trigger a user logout flow unless interactive mode is configured.
   *
   * @returns A Promise that will always resolve immediately or be a no-op, depending on implementation.
   *
   * @remarks
   * This method is not supported and should not be used to initiate logout unless interactive mode is enabled.
   */
  logout(): Promise<void>;

  /**
   * Acquires an access token for the specified scopes.
   *
   * @param options - An object specifying the required scopes and an optional `interactive` flag.
   *   - `request.scopes`: The scopes for which the token is requested.
   *   - `interactive`: If true, may trigger an interactive login if silent acquisition fails (not supported unless interactive mode is enabled).
   * @returns A Promise that resolves to a string representing the acquired access token.
   *
   * @remarks
   * This is the primary method for obtaining tokens for API calls or resource access.
   */
  acquireAccessToken(options: {
    request: { scopes: string[] };
    interactive?: boolean;
  }): Promise<string>;
}
