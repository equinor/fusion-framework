import type {
  IPublicClientApplication,
  AccountInfo,
  AuthenticationResult,
  PopupRequest,
  RedirectRequest,
} from '@azure/msal-browser';

/**
 * Authentication behavior type determining the interaction method.
 *
 * - 'popup': Opens authentication in a popup window (returns result immediately)
 * - 'redirect': Navigates browser to authentication page (returns void, result via handleRedirectPromise)
 */
export type AuthBehavior = 'popup' | 'redirect';

/**
 * Options for acquiring an access token.
 *
 * This type ensures either the legacy or modern approach is used by requiring
 * the request parameter while allowing optional configuration for behavior and silent mode.
 *
 * @property request - MSAL request object for popup or redirect authentication
 * @property behavior - Optional authentication method (popup or redirect). Defaults to 'redirect'
 * @property silent - Optional flag to attempt silent token acquisition first. Defaults to true if account is available
 */
export type AcquireTokenOptions = {
  request: PopupRequest | RedirectRequest;
  behavior?: AuthBehavior;
  silent?: boolean;
};

/**
 * Result type for token acquisition operations.
 *
 * Returns the authentication result on success, or null/undefined on failure or redirect.
 * For redirect flows, returns undefined (void) because browser navigation interrupts execution.
 */
export type AcquireTokenResult = AuthenticationResult | null | undefined;

/**
 * Options for user login/authentication.
 *
 * @property request - MSAL request object for popup or redirect authentication
 * @property behavior - Optional authentication method (popup or redirect). Defaults to 'redirect'
 * @property silent - Optional flag to attempt silent SSO authentication first. Defaults to true
 */
export type LoginOptions = {
  request: PopupRequest | RedirectRequest;
  behavior?: AuthBehavior;
  silent?: boolean;
};

/**
 * Options for user logout.
 *
 * @property redirectUri - Optional URI to redirect to after logout completes
 * @property account - Optional account to log out (defaults to active account if not provided)
 */
export type LogoutOptions = {
  redirectUri?: string;
  account?: AccountInfo;
};

/**
 * Result type for login operations.
 *
 * Returns the authentication result on success, or undefined on redirect-based flows
 * (where the browser navigates away). For redirect flows, result is available via handleRedirectPromise.
 */
export type LoginResult = AuthenticationResult | undefined;

/**
 * Interface for MSAL v4 client with additional properties and methods.
 *
 * This interface extends the standard MSAL v4 PublicClientApplication
 * with additional properties and methods needed for the framework.
 *
 * @example
 * ```typescript
 * const client: IMsalClient = new MsalClient(config);
 *
 * // Access additional properties
 * const tenantId = client.tenantId;
 * const hasValidClaims = client.hasValidClaims;
 *
 * // Use enhanced methods
 * const result = await client.login({ request: { scopes: ['User.Read'] } });
 * ```
 */
export interface IMsalClient extends IPublicClientApplication {
  /** Configured client ID */
  clientId: string | undefined;

  /** Tenant ID for the client domain */
  tenantId: string | undefined;

  /** Check if the current account has valid claims */
  hasValidClaims: boolean;

  /**
   * Login user with enhanced options
   * @param options - Login configuration options
   * @returns Promise resolving to authentication result or undefined
   */
  login(options: LoginOptions): Promise<LoginResult>;

  /**
   * Logout user with enhanced options
   * @param options - Logout configuration options
   * @returns Promise resolving to void
   */
  logout(options: LogoutOptions): Promise<void>;

  /**
   * Acquire access token with enhanced options
   * @param options - Token acquisition configuration options
   * @returns Promise resolving to authentication result or null/undefined
   */
  acquireToken(options: AcquireTokenOptions): Promise<AcquireTokenResult>;
}
