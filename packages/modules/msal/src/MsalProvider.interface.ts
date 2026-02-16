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

/**
 * Legacy token acquisition options maintaining backward compatibility.
 *
 * This type extends `AcquireTokenOptions` with an optional `scopes` property
 * to support legacy API calls that passed scopes directly rather than in the request object.
 *
 * @property scopes - Optional array of OAuth scopes (deprecated, use request.scopes)
 *
 * @deprecated Use the modern format with scopes in the request object instead
 * @example
 * ```typescript
 * // Deprecated legacy format
 * acquireToken({ scopes: ['User.Read'] })
 *
 * // Modern format (preferred)
 * acquireToken({ request: { scopes: ['User.Read'] } })
 * ```
 */
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
 * const provider: IMsalProvider = new MsalProvider(config);
 *
 * // Login user (v4 format)
 * await provider.login({ request: { scopes: ['User.Read'] } });
 *
 * // Acquire token (v4 format - recommended)
 * const token = await provider.acquireAccessToken({
 *   request: { scopes: ['https://graph.microsoft.com/.default'] }
 * });
 * ```
 */
export interface IMsalProvider extends IProxyProvider {
  /**
   * The MSAL PublicClientApplication client instance.
   *
   * Provides access to the underlying MSAL client for advanced use cases.
   * Use provider methods for standard authentication operations.
   */
  readonly client: IMsalClient;

  /**
   * The currently authenticated account information.
   *
   * Returns the active account if available, or null if no user is authenticated.
   */
  readonly account: AccountInfo | null;

  /**
   * Initializes the MSAL provider and handles authentication state.
   *
   * This method must be called before using other provider methods. It:
   * - Initializes the MSAL client
   * - Processes any pending authentication redirects
   * - Attempts automatic login if requiresAuth is enabled
   *
   * @returns Promise that resolves when initialization is complete
   */
  initialize(): Promise<void>;

  /**
   * Acquires an access token string for the specified scopes.
   *
   * This is a convenience method that returns only the access token string,
   * unlike `acquireToken` which returns the full authentication result.
   *
   * @param options - Token acquisition options including scopes
   * @returns Promise resolving to the access token string, or undefined if acquisition fails
   *
   * @example
   * ```typescript
   * const token = await provider.acquireAccessToken({
   *   request: { scopes: ['User.Read'] }
   * });
   * ```
   */
  acquireAccessToken(options?: AcquireTokenOptions|AcquireTokenOptionsLegacy): Promise<string | undefined>;

  /**
   * Acquires a full authentication result including token and account information.
   *
   * This method attempts silent token acquisition first, then falls back to interactive
   * authentication based on the configured behavior (popup or redirect).
   *
   * @param options - Token acquisition options including scopes
   * @returns Promise resolving to full authentication result or null/undefined on failure
   *
   * @example
   * ```typescript
   * const result = await provider.acquireToken({
   *   request: { scopes: ['User.Read'] },
   *   behavior: 'popup'
   * });
   * ```
   */
  acquireToken(options?: AcquireTokenOptions|AcquireTokenOptionsLegacy): Promise<AcquireTokenResult>;

  /**
   * Authenticates a user interactively with Microsoft Identity Platform.
   *
   * This method implements a sophisticated flow that attempts silent authentication
   * first (if configured) and falls back to interactive authentication based on behavior.
   *
   * @param options - Login configuration options including request, behavior, and silent flag
   * @returns Promise resolving to authentication result or undefined for redirect flows
   *
   * @example
   * ```typescript
   * // Basic login with default settings
   * await provider.login({ request: { scopes: ['User.Read'] } });
   * ```
   */
  login(options: LoginOptions): Promise<LoginResult>;

  /**
   * Logs out the current user and clears authentication state.
   *
   * Initiates a logout flow that clears local tokens and navigates to Microsoft's
   * logout endpoint. Always uses redirect flow for reliability.
   *
   * @param options - Optional logout configuration
   * @returns Promise resolving to true on success, false on failure
   *
   * @example
   * ```typescript
   * // Basic logout
   * await provider.logout();
   *
   * // Logout with redirect
   * await provider.logout({ redirectUri: 'https://app.com/logout' });
   * ```
   */
  logout(options?: LogoutOptions): Promise<boolean>;

  /**
   * Processes any pending authentication redirect after browser navigation.
   *
   * This method must be called on app initialization to handle authentication
   * results from redirect-based flows. It processes tokens and account information
   * returned by Microsoft's identity provider.
   *
   * @returns Promise resolving to authentication result or null if no redirect pending
   *
   * @example
   * ```typescript
   * // Call on app startup
   * const result = await provider.handleRedirect();
   * if (result?.account) {
   *   // User successfully authenticated via redirect
   * }
   * ```
   */
  handleRedirect(): Promise<AuthenticationResult | null>;
}
