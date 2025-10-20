import type {
  IPublicClientApplication,
  AccountInfo,
  AuthenticationResult,
  PopupRequest,
  RedirectRequest,
} from '@azure/msal-browser';

export type AuthBehavior = 'popup' | 'redirect';

// Base interface for common properties
interface BaseAcquireTokenOptions {
  account?: AccountInfo;
  behavior?: AuthBehavior;
  silent?: boolean;
}

// Legacy interface using direct scopes property
export interface LegacyAcquireTokenOptions extends BaseAcquireTokenOptions {
  scopes: string[];
  request?: never; // Prevent mixing with request-based approach
}

// Modern interface using MSAL v4 request structure
export interface ModernAcquireTokenOptions extends BaseAcquireTokenOptions {
  request: PopupRequest | RedirectRequest;
  scopes?: never; // Prevent mixing with legacy scopes approach
}

// Union type that ensures either legacy OR modern approach is used
export type AcquireTokenOptions = LegacyAcquireTokenOptions | ModernAcquireTokenOptions;

export type AcquireTokenResult = AuthenticationResult | null | undefined;

export type LoginOptions = {
  request: PopupRequest | RedirectRequest;
  behavior?: AuthBehavior;
  silent?: boolean;
};

export type LogoutOptions = {
  redirectUri?: string;
  account?: AccountInfo;
};

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
  /** Request origin from browser storage */
  requestOrigin: string | null;

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
   * Acquire access token with enhanced options
   * @param options - Token acquisition configuration options
   * @returns Promise resolving to authentication result or null/undefined
   */
  acquireToken(options: AcquireTokenOptions): Promise<AcquireTokenResult>;
}
