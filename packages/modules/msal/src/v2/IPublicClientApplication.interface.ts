import type { AccountInfo, AuthenticationResult } from './types';

/**
 * MSAL v2 compatible PublicClientApplication interface.
 *
 * This interface defines the contract for MSAL v2 PublicClientApplication
 * to maintain backward compatibility while using MSAL v4 implementation.
 *
 * @example
 * ```typescript
 * const v4Client = new PublicClientApplication(config);
 * const v2Client = createProxyClient_v2(v4Client);
 *
 * // Use v2-compatible methods
 * const accounts = v2Client.getAllAccounts();
 * const token = await v2Client.acquireTokenSilent({ scopes: ['User.Read'], account });
 * ```
 */
export interface IPublicClientApplication {
  /**
   * Get all cached accounts
   * @returns Array of cached account information
   */
  getAllAccounts(): AccountInfo[];

  /**
   * Acquire token silently using cached credentials
   * @param request - Token request parameters
   * @returns Promise resolving to authentication result
   */
  acquireTokenSilent(request: {
    scopes: string[];
    account: AccountInfo;
  }): Promise<AuthenticationResult>;

  /**
   * Login user via popup window
   * @param request - Optional login request parameters
   * @returns Promise resolving to authentication result
   */
  loginPopup(request?: { scopes?: string[] }): Promise<AuthenticationResult>;

  /**
   * Login user via redirect
   * @param request - Optional login request parameters
   * @returns Promise that resolves when redirect is initiated
   */
  loginRedirect(request?: { scopes?: string[] }): Promise<void>;

  /**
   * Logout user via redirect
   * @param request - Optional logout request parameters
   * @returns Promise that resolves when logout is complete
   */
  logoutRedirect(request?: {
    postLogoutRedirectUri?: string;
    account?: AccountInfo;
  }): Promise<void>;

  /**
   * Handle authentication redirect after login/logout
   * @returns Promise resolving to authentication result or null
   */
  handleRedirectPromise(): Promise<AuthenticationResult | null>;

  /**
   * Get the currently active account
   * @returns Active account information or null
   */
  getActiveAccount(): AccountInfo | null;
}
