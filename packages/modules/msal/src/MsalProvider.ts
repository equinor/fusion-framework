import type {
  ITelemetryProvider,
  TelemetryItem,
  TelemetryException,
  IMeasurement,
} from '@equinor/fusion-framework-module-telemetry';

import { TelemetryLevel } from '@equinor/fusion-framework-module-telemetry';

import { BaseModuleProvider } from '@equinor/fusion-framework-module/provider';

import type { MsalConfig } from './MsalConfigurator';
import type { AcquireTokenOptionsLegacy, IMsalProvider } from './MsalProvider.interface';
import { createProxyProvider } from './create-proxy-provider';
import type {
  AcquireTokenOptions,
  AcquireTokenResult,
  IMsalClient,
  LoginOptions,
  LoginResult,
  LogoutOptions,
} from './MsalClient.interface';

import type { AccountInfo, AuthenticationResult } from './types';
import { resolveVersion } from './versioning/resolve-version';
import { version } from './version';
import type { MsalModuleVersion } from './static';

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
 * await provider.login({ request: { scopes: ['User.Read'] } });
 *
 * // Acquire token
 * const token = await provider.acquireAccessToken({
 *   request: { scopes: ['https://graph.microsoft.com/.default'] }
 * });
 * ```
 */
export class MsalProvider extends BaseModuleProvider<MsalConfig> implements IMsalProvider {
  #client: IMsalClient;
  #telemetry: {
    provider?: ITelemetryProvider;
    metadata: Record<string, unknown>;
    scope: string[];
  };
  #requiresAuth?: boolean;
  #authCode?: string;

  /**
   * The MSAL module version enum value indicating the API compatibility level.
   *
   * This getter resolves the current version string to its corresponding enum value,
   * determining which MSAL version's API surface this provider implements. This is used
   * for version-specific behavior and proxy provider creation.
   *
   * @returns The MSAL module version enum (V2, V4, etc.)
   */
  get msalVersion(): MsalModuleVersion {
    return resolveVersion(version).enumVersion;
  }

  /**
   * The MSAL client instance.
   *
   * Provides access to the underlying MSAL PublicClientApplication for advanced use cases.
   * Prefer using provider methods for standard authentication operations.
   */
  get client(): IMsalClient {
    return this.#client;
  }

  /**
   * The currently authenticated account.
   *
   * Returns the active account if a user is authenticated, or null if no user is logged in.
   * This is a shorthand for `client.getActiveAccount()`.
   */
  get account(): AccountInfo | null {
    return this.#client.getActiveAccount();
  }

  /**
   * @deprecated Use account instead
   * @returns The currently authenticated account or undefined if no user is logged in.
   */
  get defaultAccount(): AccountInfo | undefined {
    this._trackException('MsalPrvider.defaultAccount.deprecated', TelemetryLevel.Warning, {
      exception: new Error(
        'defaultAccount is deprecated, use account instead. This will be removed in the next major version.',
      ),
      properties: {
        message:
          'defaultAccount is deprecated, use account instead. This will be removed in the next major version.',
        reason:
          'This is most likely due to accessing the framework directly from application code, instead of using the application hooks.',
      },
    });
    return this.account ?? undefined;
  }

  /**
   * Creates a new MSAL provider instance.
   *
   * @param config - Complete MSAL configuration including client, telemetry, and auth requirements
   * @throws {Error} If client is not provided in configuration
   */
  constructor(config: MsalConfig) {
    super({
      version,
      config,
    });
    this.#requiresAuth = config.requiresAuth;
    this.#telemetry = config.telemetry;

    // Extract auth code from config if present
    // This will be used during initialize to exchange for tokens
    this.#authCode = config.authCode;

    // Validate required client configuration
    if (!config.client) {
      const error = new Error(
        'Client is required, please provide a valid client in the configuration',
      );
      this._trackException('constructor.client-required', TelemetryLevel.Error, {
        exception: error,
      });
      throw error;
    }
    this.#client = config.client;
  }

  /**
   * Initializes the MSAL provider and sets up authentication state.
   *
   * This method must be called before using any authentication operations. It performs:
   * - Client initialization
   * - Auth code exchange (if backend-issued code provided)
   * - Redirect result handling (if returning from auth flow)
   * - Automatic login attempt if requiresAuth is enabled and no valid session exists
   *
   * @returns Promise that resolves when initialization is complete
   *
   * @remarks
   * Auth code exchange happens before the requiresAuth check, allowing automatic sign-in
   * without user interaction when a valid backend-issued code is provided. If exchange fails,
   * the provider falls back to standard MSAL authentication flows.
   *
   * The provider will attempt automatic login with empty scopes if requiresAuth is true.
   * Apps should call acquireToken with actual scopes after initialization completes.
   */
  async initialize(): Promise<void> {
    const measurement = this._trackMeasurement('initialize', TelemetryLevel.Debug);
    // Initialize the underlying MSAL client first
    await this.#client.initialize();

    // Priority 0: Exchange auth code if provided by backend
    // This must happen before the requiresAuth check so tokens are cached
    if (this.#authCode) {
      try {
        this._trackEvent('initialize.exchanging-auth-code', TelemetryLevel.Information);

        // Use MSAL's acquireTokenByCode to exchange backend auth code for tokens
        // This follows Microsoft's standard SPA Auth Code Flow pattern
        const clientId = this.#client.clientId;
        if (!clientId) {
          throw new Error('Client ID is required for auth code exchange');
        }

        // Exchange the auth code for tokens using the client ID's default scope.
        // The `/.default` scope represents all permissions configured for this app in Entra ID,
        // ensuring the exchanged tokens have the correct app-level permissions without requiring
        // the caller to specify scopes. This follows MSAL's recommended SPA auth code pattern.
        // This method is inherited from PublicClientApplication (MSAL Browser v4+)
        const result = await this.#client.acquireTokenByCode({
          code: this.#authCode,
          scopes: [`${clientId}/.default`],
        });

        // Successfully exchanged auth code - set active account
        if (result.account) {
          this.#client.setActiveAccount(result.account);
          this._trackEvent('initialize.auth-code-exchanged-account', TelemetryLevel.Information, {
            properties: {
              username: result.account.username,
            },
          });
        }
      } catch (error) {
        // Auth code exchange failed - log and fall back to standard flows
        this._trackException('initialize.auth-code-exchange-failed', TelemetryLevel.Warning, {
          exception: error instanceof Error ? error : new Error(String(error)),
          properties: {
            message: error instanceof Error ? error.message : String(error),
            reason: 'Auth code exchange failed, falling back to standard authentication flows',
          },
        });
        // Continue to requiresAuth check - will trigger standard login if needed
      } finally {
        // Clear auth code to avoid repeated attempts
        this.#authCode = undefined;
      }
    }

    // Only attempt authentication if this provider requires it
    if (this.#requiresAuth) {
      // Priority 1: Check if returning from redirect-based authentication
      // This handles cases where user just completed a login/acquireToken via redirect
      const handleRedirectResult = await this.handleRedirect();
      if (handleRedirectResult?.account) {
        // Successfully authenticated via redirect - set as active account
        // This means the user was redirected to Microsoft and came back authenticated
        this.#client.setActiveAccount(handleRedirectResult.account);
        this._trackEvent('initialize.active-account-set-by-callback', TelemetryLevel.Information, {
          properties: {
            username: handleRedirectResult.account.username,
          },
        });
      } else if (!this.#client.hasValidClaims) {
        // Priority 2: No valid session found - attempt automatic login
        // This handles first-time app load when no authentication state exists
        // Note: Using empty scopes here as we don't know what scopes the app needs yet
        // App should call acquireToken with actual scopes after initialization
        const loginResult = await this.login({ request: { scopes: [] } });
        if (loginResult?.account) {
          // Automatic login successful - set as active account
          this.#client.setActiveAccount(loginResult.account);
          this._trackEvent('initialize.active-account-set-by-login', TelemetryLevel.Information, {
            properties: {
              username: loginResult.account.username,
            },
          });
        }
      }
      // Priority 3: If hasValidClaims is true, user is already authenticated - no action needed
    }
    measurement.measure();
  }

  /**
   * Acquire an access token string for the specified scopes
   *
   * @param options - Token acquisition options (same as acquireToken)
   * @returns Promise resolving to access token string, or undefined if acquisition fails
   *
   * @example
   * ```typescript
   * const token = await msalProvider.acquireAccessToken({
   *   request: { scopes: ['api.read'] }
   * });
   * if (token) {
   *   // Use token for API calls
   *   fetch('/api/data', { headers: { Authorization: `Bearer ${token}` } });
   * }
   * ```
   */
  async acquireAccessToken(options: AcquireTokenOptionsLegacy): Promise<string | undefined> {
    const { accessToken } = (await this.acquireToken(options)) ?? {};
    return accessToken;
  }

  /**
   * Acquire full authentication result for the specified scopes
   *
   * @param options - Token acquisition options including scopes, behavior, and silent mode
   * @param options.request.scopes - Array of OAuth scopes to request access for
   * @param options.scopes - Legacy scopes format (deprecated, use request.scopes)
   * @param options.behavior - Authentication behavior ('redirect' or 'popup')
   * @param options.silent - Whether to attempt silent token acquisition first
   * @returns Promise resolving to authentication result containing access token and account info
   *
   * @remark Empty scopes are currently tracked as telemetry exceptions but execution continues for monitoring purposes.
   * This behavior will be changed to throw exceptions once sufficient metrics are collected.
   *
   * @example
   * ```typescript
   * // Modern API format
   * const result = await msalProvider.acquireToken({
   *   request: { scopes: ['user.read', 'api.write'] },
   *   behavior: 'redirect',
   *   silent: true
   * });
   *
   * // Legacy format (deprecated)
   * const result = await msalProvider.acquireToken({
   *   scopes: ['user.read'],
   *   silent: false
   * });
   * ```
   */
  async acquireToken(options: AcquireTokenOptionsLegacy): Promise<AcquireTokenResult> {
    const {
      behavior = 'redirect',
      silent = true,
      request = {} as AcquireTokenOptions['request'],
    } = options;

    const account = request.account ?? this.account ?? undefined;
    // Extract scopes from either new format (request.scopes) or legacy format (scopes)
    const scopes = options.request?.scopes ?? options?.scopes ?? [];

    const telemetryProperties = { behavior, silent, scopes };

    // Track usage of deprecated legacy scopes format for migration monitoring
    if (options.scopes) {
      this._trackEvent('acquireToken.legacy-scopes-provided', TelemetryLevel.Warning, {
        properties: telemetryProperties,
      });
    }

    // Handle empty scopes - currently monitoring for telemetry, will throw in future
    if (scopes.length === 0) {
      const exception = new Error('Empty scopes provided, not allowed');
      this._trackException('acquireToken.missing-scope', TelemetryLevel.Warning, {
        exception,
        properties: telemetryProperties,
      });
      // TODO: throw exception when sufficient metrics are collected
      // This allows us to monitor how often empty scopes are provided before enforcing validation
    }

    try {
      const measurement = this._trackMeasurement('acquireToken', TelemetryLevel.Information, {
        properties: telemetryProperties,
      });
      // Merge account, original request options, and resolved scopes
      // Account ensures context awareness, request preserves custom options, scopes uses resolved value
      const result = await this.#client.acquireToken({
        behavior,
        silent,
        request: { ...options.request, account, scopes },
      });
      measurement?.measure();
      return result;
    } catch (error) {
      this._trackException('acquireToken-failed', TelemetryLevel.Error, {
        exception: error as Error,
        properties: telemetryProperties,
      });
      throw error;
    }
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
    const { behavior = 'redirect', silent = true, request } = options;

    // Determine if silent login is possible based on available account/hint information
    // Silent login requires either an account object or a loginHint to work
    const canLoginSilently = silent && (request.account || request.loginHint);

    const telemetryProperties = { behavior, silent, canLoginSilently, scopes: request.scopes };

    // Default to active account if no account/hint provided in request
    // This allows silent login to work automatically with existing authentication state
    request.account ??= this.account ?? undefined;

    // Default to empty scopes if none provided
    // Empty scopes are tracked for monitoring but allowed for compatibility
    if (!request.scopes) {
      request.scopes = [];
      this._trackEvent('login.missing-scope', TelemetryLevel.Warning, {
        properties: telemetryProperties,
      });
    }

    this._trackEvent('login', TelemetryLevel.Information, {
      properties: telemetryProperties,
    });

    // Attempt silent authentication first if conditions are met
    // This provides better UX by avoiding unnecessary popups/redirects
    if (canLoginSilently) {
      try {
        return await this.#client.ssoSilent(request);
      } catch (error) {
        // Silent login failed - track for monitoring but continue to interactive flow
        this._trackException('login.silent-failed', TelemetryLevel.Warning, {
          exception: error as Error,
          properties: telemetryProperties,
        });
        // Fall through to interactive authentication
      }
    }

    switch (behavior) {
      case 'popup':
        return await this.#client.loginPopup(request);
      case 'redirect':
        await this.#client.loginRedirect(request);
        break;
      default:
        throw new Error(
          `Invalid behavior provided: ${behavior}, please provide a valid behavior, see options.behavior for more information.`,
        );
    }
  }

  /**
   * Logs out the current user and clears authentication state.
   *
   * This method initiates a logout flow using redirect, which navigates to Microsoft's
   * logout endpoint to clear session cookies and tokens. The method returns true on
   * successful logout initiation, or false if logout fails.
   *
   * @param options - Optional logout configuration
   * @param options.account - Account to log out (defaults to active account)
   * @param options.redirectUri - URI to redirect to after logout completes
   * @returns Promise resolving to true on success, false on failure
   *
   * @remarks
   * - Logout always uses redirect flow (more reliable than popup)
   * - Returns false on error instead of throwing to prevent breaking app flow
   * - Browser will navigate away during logout process
   *
   * @example
   * ```typescript
   * // Basic logout
   * const success = await provider.logout();
   *
   * // Logout with custom redirect
   * await provider.logout({ redirectUri: 'https://app.com/logout' });
   * ```
   */
  async logout(options?: LogoutOptions): Promise<boolean> {
    this._trackEvent('logout', TelemetryLevel.Information, {
      properties: {
        redirectUri: options?.redirectUri,
      },
    });

    try {
      // Logout the specific account (or current account if none specified)
      await this.#client.logout({ account: this.account ?? undefined, ...options });
      return true; // Success
    } catch (error) {
      // Logout failed - track error but don't throw to avoid breaking app flow
      this._trackException('logout.failed', TelemetryLevel.Error, {
        exception: error as Error,
      });
    }
    return false; // Failed
  }

  /**
   * Processes any pending authentication redirect after browser navigation.
   *
   * This method must be called on app initialization to handle tokens and account information
   * returned by Microsoft's identity provider after redirect-based authentication flows.
   *
   * @returns Promise resolving to authentication result or null if no redirect pending
   *
   * @remarks
   * - Should be called once on app startup before other authentication operations
   * - Only returns a result if user just completed redirect-based login/acquireToken
   * - Safe to call even when no redirect is pending (returns null)
   *
   * @example
   * ```typescript
   * // Call on app startup
   * const result = await provider.handleRedirect();
   * if (result?.account) {
   *   console.log(`Authenticated as: ${result.account.username}`);
   *   provider.client.setActiveAccount(result.account);
   * }
   * ```
   */
  async handleRedirect(): Promise<AuthenticationResult | null> {
    // Process any pending redirect from authentication flow
    const result = await this.client.handleRedirectPromise();
    if (result) {
      // Track successful redirect completion for monitoring
      this._trackEvent('handleRedirect.success', TelemetryLevel.Information, {
        properties: {
          username: result.account?.username,
        },
      });
    }
    return result;
  }

  /**
   * Creates a proxy provider for version compatibility.
   *
   * This method creates a version-specific proxy wrapper around this provider to maintain
   * backward compatibility with different MSAL versions while using the latest v4 implementation.
   *
   * @param version - Target version string (e.g., '2.0.0', '4.0.0', 'v2', 'v4')
   * @returns Proxy provider covariant with the specified version
   *
   * @remarks
   * - Proxies adapt the v4 API to match older version signatures
   * - Useful for gradual migration scenarios
   * - Version compatibility is tracked via telemetry
   * - Throws error if unsupported version is requested
   *
   * @example
   * ```typescript
   * // Create v2-compatible proxy
   * const v2Proxy = provider.createProxyProvider('2.0.0');
   * await v2Proxy.login(); // Uses v2-compatible signature
   * ```
   */
  createProxyProvider<T = IMsalProvider>(version: string): T {
    // Track proxy provider creation for compatibility monitoring
    this._trackEvent('createProxyProvider', TelemetryLevel.Debug, {
      properties: {
        version: version,
      },
    });

    // Parse and validate the requested version string
    const resolvedVersion = resolveVersion(version);

    this._trackEvent('createProxyProvider.version-resolved', TelemetryLevel.Information, {
      properties: resolvedVersion,
    });

    // Warn if using outdated version - helps track migration progress
    if (!resolvedVersion.satisfiesLatest) {
      this._trackEvent('createProxyProvider.outdated-version', TelemetryLevel.Warning, {
        properties: resolvedVersion,
      });
    }

    try {
      // create the proxy provider
      return createProxyProvider(this, version);
    } catch (error) {
      this._trackException('createProxyProvider.failed', TelemetryLevel.Error, {
        exception: error as Error,
        properties: resolvedVersion,
      });
      throw error;
    }
  }

  /**
   * Tracks a telemetry event with MSAL module-specific naming and metadata.
   *
   * This protected method provides a standardized way to track events within the MSAL module.
   * It automatically prefixes the event name with 'module-msal.' and includes the module's
   * configured scope and metadata.
   *
   * @param name - The event name (will be prefixed with 'module-msal.')
   * @param level - The telemetry level for the event
   * @param options - Additional telemetry options (excluding type, name, level, scope, metadata)
   */
  protected _trackEvent(
    name: string,
    level: TelemetryLevel,
    options?: Omit<TelemetryItem, 'type' | 'name' | 'level' | 'scope' | 'metadata'>,
  ): void {
    this.#telemetry.provider?.trackEvent({
      name: `module-msal.${name}`,
      level,
      scope: this.#telemetry.scope,
      metadata: this.#telemetry.metadata,
      ...options,
    });
  }

  /**
   * Starts a telemetry measurement with MSAL module-specific naming and metadata.
   *
   * This protected method provides a standardized way to measure performance within the MSAL module.
   * It automatically prefixes the measurement name with 'module-msal.' and includes the module's
   * configured scope and metadata. Returns a measurement object with a measure function.
   *
   * If no telemetry provider is available, returns a no-op measurement that returns -1.
   *
   * @param name - The measurement name (will be prefixed with 'module-msal.')
   * @param level - The telemetry level for the measurement
   * @param options - Additional telemetry options (excluding type, name, level, scope, metadata)
   * @returns A measurement object with a measure function, or a no-op measurement if no provider
   */
  protected _trackMeasurement(
    name: string,
    level: TelemetryLevel,
    options?: Omit<TelemetryItem, 'type' | 'name' | 'level' | 'scope' | 'metadata'>,
  ): Pick<IMeasurement, 'measure'> {
    return (
      this.#telemetry.provider?.measure({
        name: `module-msal.${name}`,
        level,
        scope: this.#telemetry.scope,
        metadata: this.#telemetry.metadata,
        ...options,
      }) ?? {
        measure: () => -1,
      }
    );
  }

  /**
   * Tracks a telemetry exception with MSAL module-specific naming and metadata.
   *
   * This protected method provides a standardized way to track exceptions within the MSAL module.
   * It automatically prefixes the exception name with 'module-msal.' and includes the module's
   * configured scope and metadata.
   *
   * @param name - The exception name (will be prefixed with 'module-msal.')
   * @param level - The telemetry level for the exception
   * @param options - Additional telemetry options (excluding type, name, level, scope, metadata)
   */
  protected _trackException(
    name: string,
    level: TelemetryLevel,
    options: Omit<TelemetryException, 'type' | 'name' | 'level' | 'scope' | 'metadata'>,
  ): void {
    this.#telemetry.provider?.trackException({
      name: `module-msal.${name}`,
      level,
      scope: this.#telemetry.scope,
      metadata: this.#telemetry.metadata,
      ...options,
    });
  }
}
