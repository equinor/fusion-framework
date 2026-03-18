import type {
  AccountInfo as AccountInfoBase,
  AuthenticationResult,
  IPublicClientApplication,
} from './types';

/**
 * Simplified ID token claims used by the v2 compatibility layer.
 *
 * @property aud - Token audience (application ID)
 * @property exp - Token expiration time (seconds since epoch)
 */
export type IdTokenClaims = {
  aud: string;
  exp: number;
};

/**
 * Extended account information for v2 compatibility.
 *
 * Augments the base v2 `AccountInfo` with typed ID token claims.
 */
export type AccountInfo = AccountInfoBase & {
  idTokenClaims?: IdTokenClaims;
};

/**
 * Authentication behavior type for v2-compatible login and token flows.
 *
 * - `'popup'` — Opens a popup window for authentication
 * - `'redirect'` — Navigates the browser to the Microsoft login page
 */
export type AuthBehavior = 'popup' | 'redirect';

/**
 * Simplified authentication request for v2-compatible methods.
 *
 * @property scopes - Optional OAuth scopes to request (e.g. `['User.Read']`)
 * @property loginHint - Optional username hint to pre-fill the login form
 */
export type AuthRequest = {
  scopes?: string[];
  loginHint?: string;
};

/**
 * Interface for MSAL v2 compatible authentication client.
 *
 * This interface defines the contract for authentication clients that maintain
 * backward compatibility with MSAL v2 API while using MSAL v4 implementation
 * under the hood. This is useful for gradual migration scenarios.
 *
 * @example
 * ```typescript
 * const client: IAuthClient_v2 = createProxyClient(baseClient);
 *
 * // Use v2 compatible API
 * const account = client.account;
 * const result = await client.login({ scopes: ['User.Read'] });
 * ```
 */
export interface IAuthClient extends IPublicClientApplication {
  /**
   * Tenant ID for the client domain
   */
  readonly tenantId: string;

  /**
   * Returns account for client tenant that MSAL currently has data for.
   * (the account object is created at the time of successful login)
   */
  get account(): AccountInfo | undefined;

  /**
   * Check if the current account has valid claims
   */
  get hasValidClaims(): boolean;

  /**
   * Configured client ID
   */
  get clientId(): string | undefined;

  /**
   * Request origin from browser storage
   */
  get requestOrigin(): string | null;

  /**
   * Login user with optional silent authentication fallback
   * @param options - Optional authentication request options
   * @param behavior - Authentication method: 'popup' or 'redirect'
   * @param silent - Whether to attempt silent authentication first
   * @returns Promise resolving to authentication result or void
   */
  login(
    options?: AuthRequest,
    behavior?: AuthBehavior,
    silent?: boolean,
  ): Promise<AuthenticationResult | void>;

  /**
   * Acquire access token with optional silent authentication fallback
   * @param options - Authentication request options
   * @param behavior - Authentication method: 'popup' or 'redirect'
   * @param silent - Whether to attempt silent authentication first
   * @returns Promise resolving to authentication result or void
   */
  acquireToken(
    options?: AuthRequest,
    behavior?: AuthBehavior,
    silent?: boolean,
  ): Promise<AuthenticationResult | void>;
}
