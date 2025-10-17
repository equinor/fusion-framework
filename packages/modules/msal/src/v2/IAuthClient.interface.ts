import type {
  AuthenticationResult,
  AccountInfo as AccountInfoBase,
  IPublicClientApplication,
} from '@azure/msal-browser';

export type IdTokenClaims = {
  aud: string;
  exp: number;
};

export type AccountInfo = AccountInfoBase & {
  idTokenClaims?: IdTokenClaims;
};

export type AuthBehavior = 'popup' | 'redirect';

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
