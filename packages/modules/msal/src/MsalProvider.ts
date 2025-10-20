import type { EndSessionRequest } from '@azure/msal-browser';

import { BaseModuleProvider } from '@equinor/fusion-framework-module/provider';
import { MsalModuleVersion } from './static';
import type { MsalConfig } from './MsalConfigurator';
import type { IMsalProvider } from './MsalProvider.interface';
import { createProxyProvider } from './create-proxy-provider';
import type {
  AcquireTokenOptions,
  AcquireTokenResult,
  IMsalClient,
  LoginOptions,
  LoginResult,
  LogoutOptions,
} from './MsalClient.interface';

import type { AccountInfo } from './types';

export type { IMsalProvider };

/**
 * MSAL v4 compatible authentication provider for Fusion Framework.
 *
 * This provider wraps the MSAL v4 PublicClientApplication and provides
 * a simplified interface for authentication operations while maintaining
 * compatibility with the Fusion Framework module system.
 *
 * @example
 * ```typescript
 * const provider = new MsalProvider({
 *   clientId: 'your-client-id',
 *   tenantId: 'your-tenant-id',
 *   redirectUri: 'https://your-app.com/callback'
 * });
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
export class MsalProvider extends BaseModuleProvider<MsalConfig> implements IMsalProvider {
  #client: IMsalClient;
  #redirectUri: string;

  get client(): IMsalClient {
    return this.#client;
  }

  get account(): AccountInfo | null {
    return this.#client.getActiveAccount();
  }

  constructor(config: MsalConfig) {
    super({
      version: MsalModuleVersion.Latest,
      config,
    });
    if (!config.client) {
      throw new Error('Client is required');
    }
    this.#client = config.client;
    this.#redirectUri = config.redirectUri || '';
  }

  /**
   * Acquire an access token for the specified scopes
   */
  async acquireAccessToken(options: AcquireTokenOptions): Promise<string | undefined> {
    const result = await this.#client.acquireToken(options);
    return result?.accessToken ?? undefined;
  }

  /**
   * Acquire full authentication result
   */
  async acquireToken(options: AcquireTokenOptions): Promise<AcquireTokenResult> {
    return await this.#client.acquireToken(options);
  }

  /**
   * Authenticates a user using Microsoft Authentication Library.
   *
   * This method implements a sophisticated login flow that **attempts silent authentication
   * first by default** (`silent: true`) and falls back to interactive authentication based on the specified
   * behavior. The flow prioritizes user experience by minimizing unnecessary popups or redirects.
   *
   * **Authentication Flow:**
   * 1. **Silent Login Attempt** (default behavior):
   *    - Attempts SSO silent authentication using existing session
   *    - Requires `loginHint` to be provided (uses active account's username if available)
   *    - Falls back to interactive login if silent attempt fails
   *
   * 2. **Interactive Login Fallback** (based on `behavior`):
   *    - `popup`: Opens authentication popup window (default)
   *    - `redirect`: Redirects current window to authentication page
   *
   * **Default Behavior:**
   * - Attempts silent authentication first (`silent: true`)
   * - Falls back to popup authentication (`behavior: 'popup'`)
   * - Uses active account's username as login hint if not provided
   * - Warns if no scopes are specified (uses empty array)
   *
   * @param options - Login configuration options
   * @param options.request - Authentication request parameters (scopes, loginHint, etc.)
   * @param options.behavior - Authentication method: 'popup' (default) or 'redirect'
   * @param options.silent - Whether to attempt silent authentication first (**default: true**)
   *
   * @returns Promise resolving to authentication result or undefined
   *
   * @throws {Error} When authentication fails or invalid parameters provided
   *
   * @example
   * ```typescript
   * // Basic login (silent first, popup fallback - DEFAULT BEHAVIOR)
   * const result = await provider.login({
   *   request: { scopes: ['User.Read'] }
   * });
   *
   * // Skip silent, go straight to redirect
   * await provider.login({
   *   request: { scopes: ['User.Read'] },
   *   silent: false,
   *   behavior: 'redirect'
   * });
   * ```
   */
  async login(options: LoginOptions): Promise<LoginResult> {
    const {
      request,
      // by default, use popup behavior
      behavior = 'popup',
      // by default, try to login silently
      silent = true,
    } = options;

    // if no login hint is provided, use the active account's username
    request.loginHint ??= this.account?.username;

    // if no scopes are provided, use an empty array
    if (!request.scopes) {
      console.warn('No scopes provided, using []');
      request.scopes = [];
    }

    // if silent is true and a login hint is provided, try to login silently
    if (silent && request.loginHint) {
      try {
        return await this.#client.ssoSilent(request);
      } catch (error) {
        console.warn('Silent login failed, falling back to interactive:', error);
      }
    }

    // if behavior is popup, login via popup
    if (behavior === 'popup') {
      return await this.#client.loginPopup(request);
    } else {
      // if behavior is redirect, login via redirect
      await this.#client.loginRedirect(request);
    }
  }

  /**
   * Logout user
   */
  async logout(options?: LogoutOptions): Promise<void> {
    const account = options?.account || this.account;

    if (!account) {
      console.warn('No account available for logout');
      return;
    }

    const logoutRequest: EndSessionRequest = {
      account: account,
      postLogoutRedirectUri: options?.redirectUri,
    };

    await this.#client.logoutRedirect(logoutRequest);
  }

  /**
   * Handle authentication redirect
   */
  async handleRedirect(): Promise<void> {
    if (window.location.pathname === this.#redirectUri) {
      const logger = this.client.getLogger();
      const redirectUri = this.#redirectUri;
      const requestOrigin = this.#client.requestOrigin;

      await this.client.handleRedirectPromise();
      if (requestOrigin === redirectUri) {
        logger.warning(`detected callback loop from url ${this.#redirectUri}, redirecting to root`);
        window.location.replace('/');
      } else {
        window.location.replace(requestOrigin || '/');
      }
    }
  }

  /**
   * Create a proxy provider for version compatibility
   */
  createProxyProvider<T = IMsalProvider>(version: string): T {
    return createProxyProvider(this, version);
  }
}
