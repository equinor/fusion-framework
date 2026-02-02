import {
  PublicClientApplication,
  type SilentRequest,
  type Configuration,
  type EndSessionRequest,
  type PopupRequest,
  type RedirectRequest,
} from '@azure/msal-browser';

import type {
  IMsalClient,
  AcquireTokenResult,
  LoginOptions,
  LogoutOptions,
  LoginResult,
  AcquireTokenOptions,
} from './MsalClient.interface';

export type { IMsalClient };

/**
 * Fallback correlation ID for logger calls when request doesn't provide one.
 * Empty string indicates a non-request-specific log (validation, configuration warnings).
 */
const FUSION_CORRELATION_ID = '';

/**
 * MSAL client configuration extending the standard MSAL Configuration.
 *
 * This type adds tenant-specific configuration options while maintaining
 * full compatibility with the base MSAL Configuration type.
 *
 * @remarks
 * The `tenantId` in the auth configuration is optional but recommended for
 * multi-tenant applications. When provided, it's used for better tenant isolation
 * and can be accessed via the client's `tenantId` property.
 */
export type MsalClientConfig = Configuration & {
  auth: {
    /** Optional tenant identifier for Azure AD tenant */
    tenantId?: string;
  };
};

/**
 * MSAL v4 client implementation with extended properties and methods.
 *
 * This class extends the standard MSAL PublicClientApplication to provide
 * additional properties (tenantId, clientId, hasValidClaims) and enhanced
 * authentication methods with better options for behavior and silent flows.
 *
 * @example
 * ```typescript
 * const config: MsalClientConfig = {
 *   auth: {
 *     clientId: 'your-client-id',
 *     authority: 'https://login.microsoftonline.com/your-tenant-id',
 *     tenantId: 'your-tenant-id'
 *   }
 * };
 * const client = new MsalClient(config);
 * await client.initialize();
 * ```
 */
export class MsalClient extends PublicClientApplication implements IMsalClient {
  #tenantId?: string;
  #clientId?: string;

  /**
   * Creates a new MSAL client instance.
   *
   * @param config - MSAL client configuration including auth settings
   */
  constructor(config: MsalClientConfig) {
    super(config);
    this.#tenantId = config.auth?.tenantId;
    this.#clientId = config.auth?.clientId;
  }

  /**
   * Tenant identifier for the configured Azure AD tenant.
   *
   * @returns The tenant ID string if configured, undefined otherwise
   */
  get tenantId(): string | undefined {
    return this.#tenantId;
  }

  /**
   * Client identifier (application ID) for the configured Azure AD application.
   *
   * @returns The client ID string if configured, undefined otherwise
   */
  get clientId(): string | undefined {
    return this.#clientId;
  }

  /**
   * Checks if the currently active account has valid ID token claims.
   *
   * This property validates that the ID token's expiration claim (exp) is in the future,
   * indicating the account is still authenticated and the session is valid.
   *
   * @returns True if the account has unexpired token claims, false otherwise
   */
  get hasValidClaims(): boolean {
    const idTokenClaims = this.getActiveAccount()?.idTokenClaims;
    // Compare token expiration time (seconds since epoch) with current time
    return Number(idTokenClaims?.exp) > Number(Math.ceil(Date.now() / 1000));
  }

  /**
   * Authenticates user with support for silent SSO, popup, and redirect flows.
   *
   * @param options - Login configuration with request, behavior, and silent flag
   * @returns Promise resolving to authentication result
   *
   * @remarks
   * Authentication flow priority:
   * 1. Silent SSO (if enabled and account/loginHint provided)
   * 2. Interactive method based on behavior (popup or redirect)
   *
   * **Behavior differences:**
   * - **Popup**: Opens authentication popup window and returns authentication result immediately
   * - **Redirect**: Navigates browser to Microsoft login page. Returns `void` because the browser
   *   navigates to a new page. After redirect completes, the result will be available via
   *   `handleRedirectPromise()` when the app loads on the new page.
   */
  async login(options: Required<LoginOptions>): Promise<LoginResult> {
    // Attempt silent authentication first if enabled
    // This provides better UX by avoiding unnecessary popups/redirects
    if (options.silent) {
      if (!options.request.account && !options.request.loginHint) {
        this.getLogger().warning(
          'No account or login hint provided, please provide an account or login hint in the request',
          options.request.correlationId || FUSION_CORRELATION_ID,
        );
      }
      try {
        return await this.ssoSilent(options.request as SilentRequest);
      } catch {
        // Silent login failed - continue to interactive flow
        this.getLogger().warning(
          'Silent login failed, falling back to interactive',
          options.request.correlationId || FUSION_CORRELATION_ID,
        );
      }
    }

    // Perform interactive authentication based on specified behavior
    switch (options.behavior) {
      case 'popup':
        // Popup flow - returns result immediately after user completes authentication
        return await this.loginPopup(options.request as PopupRequest);
      case 'redirect':
        // Redirect flow - browser navigates to Microsoft login page
        // Returns void because browser navigation interrupts execution on current page
        // Result will be available via handleRedirectPromise() after app loads on new page
        await this.loginRedirect(options.request as RedirectRequest);
        break;
      default:
        throw new Error(
          `Invalid behavior provided: ${options.behavior}, please provide a valid behavior, see options.behavior for more information.`,
        );
    }
  }

  /**
   * Logs out the current user and clears authentication state.
   *
   * This method initiates a logout flow using the redirect mechanism, which navigates
   * the user to the Microsoft logout endpoint to clear session cookies and tokens.
   *
   * @param options - Logout configuration options
   * @param options.account - Account to log out (defaults to active account if not provided)
   * @param options.redirectUri - URI to redirect to after logout completes
   * @returns Promise that resolves when logout redirect is initiated
   *
   * @remarks
   * - This method always uses redirect flow for logout (more reliable than popup)
   * - **Returns `void`**: The browser navigates to Microsoft's logout page, which interrupts
   *   execution on the current page. This is expected behavior for redirect-based logout.
   * - If no account is provided, uses the currently active account
   * - After redirect, user will be logged out at Microsoft's identity provider
   * - Application state and local tokens are cleared during this process
   *
   * @example
   * ```typescript
   * // Basic logout with active account
   * await client.logout();
   *
   * // Logout with custom redirect URI
   * await client.logout({
   *   redirectUri: 'https://app.com/logged-out'
   * });
   * ```
   */
  async logout(options?: LogoutOptions): Promise<void> {
    if (!options?.account) {
      this.getLogger().warning(
        'No account available for logout, please provide an account in the options',
        FUSION_CORRELATION_ID,
      );
    }

    const logoutRequest: EndSessionRequest = {
      account: options?.account,
      postLogoutRedirectUri: options?.redirectUri,
    };

    // Browser will navigate to Microsoft logout page
    // Returns void because navigation interrupts execution on current page
    await this.logoutRedirect(logoutRequest);
  }

  /**
   * Acquires an access token with smart silent/interactive fallback.
   *
   * @param options - Token acquisition configuration
   * @returns Promise resolving to authentication result or null/undefined
   *
   * @remarks
   * Token acquisition flow:
   * 1. If silent=true and account available, attempt silent token acquisition from cache
   * 2. On silent failure (or not attempted), use interactive method based on behavior
   * 3. Interactive method based on behavior (popup or redirect)
   *
   * **Behavior differences:**
   * - **Popup**: Opens authentication popup window and returns token result immediately
   * - **Redirect**: Navigates browser to Microsoft login page. Returns `void` because the browser
   *   navigates to a new page. After redirect completes, handle the result via
   *   `handleRedirectPromise()` when the app loads on the new page.
   *
   * The default silent behavior is determined by presence of account in the request.
   * This provides optimal UX by minimizing unnecessary user interactions.
   */
  async acquireToken(options: AcquireTokenOptions): Promise<AcquireTokenResult> {
    const { behavior = 'redirect', silent = !!options.request?.account, request } = options;

    if (!request) {
      throw new Error('No request provided, please provide a request in the options');
    }

    if (request.scopes.length === 0) {
      this.getLogger().warning(
        'No scopes provided, please provide scopes in the request option, see options.request for more information.',
        request.correlationId || FUSION_CORRELATION_ID,
      );
    }

    // Attempt silent token acquisition first
    // This fetches from cache or uses refresh token without user interaction
    if (silent) {
      if (request.account) {
        try {
          this.getLogger().verbose(
            'Attempting to acquire token silently',
            request.correlationId || FUSION_CORRELATION_ID,
          );
          return await this.acquireTokenSilent(request as SilentRequest);
        } catch {
          // Silent acquisition failed - fall back to interactive
          this.getLogger().warning(
            'Silent token acquisition failed, falling back to interactive',
            request.correlationId || FUSION_CORRELATION_ID,
          );
        }
      } else {
        this.getLogger().warning(
          'Cannot acquire token silently, no account provided, falling back to interactive.',
          request.correlationId || FUSION_CORRELATION_ID,
        );
      }
    }

    // Perform interactive token acquisition
    switch (behavior) {
      case 'popup':
        // Popup flow - returns token immediately after user grants permission
        return await this.acquireTokenPopup(request);
      case 'redirect':
        // Redirect flow - browser navigates to Microsoft login page
        // Returns void because browser navigation interrupts execution on current page
        // Token will be available via handleRedirectPromise() after app loads on new page
        await this.acquireTokenRedirect(request);
        break;
      default:
        throw new Error(
          `Invalid behavior provided: ${behavior}, please provide a valid behavior, see options.behavior for more information.`,
        );
    }
  }
}
