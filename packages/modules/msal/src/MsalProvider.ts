import type {
  ITelemetryProvider,
  TelemetryItem,
  TelemetryException,
  IMeasurement,
} from '@equinor/fusion-framework-module-telemetry';

import { TelemetryLevel } from '@equinor/fusion-framework-module-telemetry';

import { BaseModuleProvider } from '@equinor/fusion-framework-module/provider';

import { MsalModuleVersion } from './static';
import type { MsalConfig } from './MsalConfigurator';
import type { AcquireTokenOptionsLegacy, IMsalProvider } from './MsalProvider.interface';
import { createProxyProvider } from './create-proxy-provider';
import type {
  AcquireTokenResult,
  IMsalClient,
  LoginOptions,
  LoginResult,
  LogoutOptions,
} from './MsalClient.interface';

import type { AccountInfo, AuthenticationResult } from './types';
import { resolveVersion } from './versioning/resolve-version';

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
  #telemetry: {
    provider?: ITelemetryProvider;
    metadata: Record<string, unknown>;
    scope: string[];
  };
  #requiresAuth?: boolean;

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
    this.#requiresAuth = config.requiresAuth;
    this.#telemetry = config.telemetry;
    
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

  async initialize(): Promise<void> {
    const measurement = this._trackMeasurement('initialize', TelemetryLevel.Debug);
    await this.#client.initialize();
    
    // Only attempt authentication if this provider requires it
    if (this.#requiresAuth) {
      // First, check if we're returning from an authentication redirect
      const handleRedirectResult = await this.handleRedirect();
      if (handleRedirectResult?.account) {
        // Successfully authenticated via redirect - set as active account
        this.#client.setActiveAccount(handleRedirectResult.account);
        this._trackEvent('initialize.active-account-set-by-callback', TelemetryLevel.Information, {
          properties: {
            username: handleRedirectResult.account.username,
          },
        });
      } else if (!this.#client.hasValidClaims) {
        // No valid session found - attempt automatic login
        // Note: Using empty scopes here as we don't know what scopes the app needs yet
        const loginResult = await this.login({ request: { scopes: [] } });
        if (loginResult?.account) {
          this.#client.setActiveAccount(loginResult.account);
          this._trackEvent('initialize.active-account-set-by-login', TelemetryLevel.Information, {
            properties: {
              username: loginResult.account.username,
            },
          });
        }
      }
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
    const { behavior = 'redirect', silent = true } = options;
    const account = this.account ?? undefined;
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
      const result = await this.#client.acquireToken({
        behavior,
        silent,
        request: { account, ...options.request, scopes },
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

    const canLoginSilently = silent && (request.account || request.loginHint);

    const telemetryProperties = { behavior, silent, canLoginSilently, scopes: request.scopes };

    // if no login hint is provided, use the active account's username
    request.account ??= this.account ?? undefined;

    // if no scopes are provided, use an empty array
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
   * Logout user
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
   * Handle authentication redirect
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
   * Create a proxy provider for version compatibility
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
