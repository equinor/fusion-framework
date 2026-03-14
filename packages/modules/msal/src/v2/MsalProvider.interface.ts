import type { SemVer } from 'semver';
import type { MsalModuleVersion } from '../static';
import type { AccountInfo, AuthenticationResult } from './types';
import type { IAuthClient } from './IAuthClient.interface';

/**
 * Interface for MSAL v2 compatible authentication provider.
 *
 * This interface defines the contract for authentication providers that maintain
 * backward compatibility with MSAL v2 API while using MSAL v4 implementation
 * under the hood. Used by the v2 proxy layer during gradual migration scenarios.
 *
 * @example
 * ```typescript
 * // Obtain a v2 proxy from the current provider
 * const v2Provider: IMsalProvider = provider.createProxyProvider('2.0.0');
 *
 * // Use v2-style API
 * await v2Provider.login();
 * const token = await v2Provider.acquireAccessToken({ scopes: ['User.Read'] });
 * ```
 */
export interface IMsalProvider {
  /** Current version of the provider (MSAL module version) */
  version: string | SemVer;

  /** Current MSAL module version */
  msalVersion: MsalModuleVersion;

  /**
   * The MSAL PublicClientApplication instance (v2 compatible)
   */
  readonly client: IAuthClient;

  /**
   * The current authenticated account (v2 compatibility)
   * @deprecated Use activeAccount instead
   */
  readonly defaultAccount: AccountInfo | undefined;

  /**
   * The client configuration used to initialize this provider
   * @deprecated Configuration should not be exposed
   */
  readonly defaultConfig: unknown | undefined;

  /**
   * The MSAL client instance (v2 compatibility)
   * @deprecated Use client instead
   */
  readonly defaultClient: IAuthClient;

  /**
   * Create a new MSAL client instance
   * @deprecated This method is deprecated in MSAL v4
   */
  createClient(): IAuthClient;

  /**
   * Acquire an access token for the specified scopes
   * @param req - Auth request options (v2 compatible)
   */
  acquireAccessToken(req: { scopes: string[]; account?: AccountInfo }): Promise<string | undefined>;

  /**
   * Acquire full authentication result
   * @param req - Auth request options (v2 compatible)
   */
  acquireToken(req: {
    scopes: string[];
    account?: AccountInfo;
  }): Promise<AuthenticationResult | undefined>;

  /**
   * Login user interactively
   * @param options - Login options (v2 compatible)
   */
  login(options?: { onlyIfRequired?: boolean }): Promise<void>;

  /**
   * Logout user
   * @param options - Logout options (v2 compatible)
   */
  logout(options?: { redirectUri?: string }): Promise<void>;

  /**
   * Handle authentication redirect
   */
  handleRedirect(): Promise<void | null>;

  /**
   * Create a proxy provider for version compatibility
   * @param version - Version string
   * @returns Proxy provider
   */
  createProxyProvider<T = IMsalProvider>(version: string): T;

  /**
   * Dispose of the provider and clean up resources
   */
  dispose(): void;
}
