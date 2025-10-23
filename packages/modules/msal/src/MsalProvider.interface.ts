import type {
  AcquireTokenOptions,
  AcquireTokenResult,
  IMsalClient,
  LoginOptions,
  LoginResult,
  LogoutOptions,
} from './MsalClient.interface';

import type { IProxyProvider } from './MsalProxyProvider.interface';

import type { AccountInfo, AuthenticationResult } from './types';

export type AcquireTokenOptionsLegacy = AcquireTokenOptions & { scopes?: string[] };

/**
 * Interface for MSAL v4 authentication provider.
 *
 * This interface defines the contract for authentication providers that work
 * with Microsoft Authentication Library v4, providing a unified API for
 * token acquisition, user authentication, and account management.
 *
 * @example
 * ```typescript
 * const provider: IMsalProvider = new MsalProvider(config, client);
 *
 * // Login user
 * await provider.login({ scopes: ['User.Read'] });
 *
 * // Acquire token
 * const token = await provider.acquireAccessToken({
 *   scopes: ['https://graph.microsoft.com/.default']
 * });
 * ```
 */
export interface IMsalProvider extends IProxyProvider {
  /**
   * The MSAL PublicClientApplication instance
   */
  readonly client: IMsalClient;

  /**
   * The current authenticated account
   */
  readonly account: AccountInfo | null;

  /**
   * Initialize the MSAL provider
   */
  initialize(): Promise<void>;

  /**
   * Acquire an access token for the specified scopes
   * @param options - Token acquisition options
   */
  acquireAccessToken(options: AcquireTokenOptionsLegacy): Promise<string | undefined>;

  /**
   * Acquire full authentication result
   * @param options - Token acquisition options
   */
  acquireToken(options: AcquireTokenOptionsLegacy): Promise<AcquireTokenResult>;

  /**
   * Login user interactively
   * @param options - Login options
   */
  login(options: LoginOptions): Promise<LoginResult>;

  /**
   * Logout user
   * @param options - Logout options
   */
  logout(options?: LogoutOptions): Promise<boolean>;

  /**
   * Handle authentication redirect
   */
  handleRedirect(): Promise<AuthenticationResult | null>;
}
