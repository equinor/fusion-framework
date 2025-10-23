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
    if (!config.client) {
      const error = new Error(
        'Client is required, please provide a valid client in the configuration',
      );
      this._tractException('constructor.client-required', TelemetryLevel.Error, {
        exception: error,
      });
      throw error;
    }
    this.#client = config.client;
  }

  async initialize(): Promise<void> {
    const measurement = this._trackMeasurement('initialize', TelemetryLevel.Debug);
    await this.#client.initialize();
    if (this.#requiresAuth) {
      // if this is a auth request callback, handle the redirect and set the active account
      const handleRedirectResult = await this.handleRedirect();
      if (handleRedirectResult?.account) {
        this.#client.setActiveAccount(handleRedirectResult.account);
        this._trackEvent('initialize.active-account-set-by-callback', TelemetryLevel.Information, {
          properties: {
            username: handleRedirectResult.account.username,
          },
        });
      } else if (!this.#client.hasValidClaims) {
        // we might need to set another scope here, but we don't know which one
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
   * Acquire an access token for the specified scopes
   */
  async acquireAccessToken(options: AcquireTokenOptionsLegacy): Promise<string | undefined> {
    const { accessToken } = (await this.acquireToken(options)) ?? {};
    return accessToken;
  }

  /**
   * Acquire full authentication result
   */
  async acquireToken(options: AcquireTokenOptionsLegacy): Promise<AcquireTokenResult> {
    const { behavior = 'redirect', silent = true } = options;
    const account = this.account ?? undefined;
    const scopes = options.request?.scopes ?? options?.scopes ?? [];

    const telemetryProperties = { behavior, silent, scopes };

    if (options.scopes) {
      this._trackEvent('acquireToken.legacy-scopes-provided', TelemetryLevel.Warning, {
        properties: telemetryProperties,
      });
    }

    if (scopes.length === 0) {
      const exception = new Error('Empty scopes provided, not allowed');
      this._tractException('acquireToken.missing-scope', TelemetryLevel.Warning, {
        exception,
        properties: telemetryProperties,
      });
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
      this._tractException('acquireToken-failed', TelemetryLevel.Error, {
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

    // if silent is true and a login hint is provided, try to login silently
    if (canLoginSilently) {
      try {
        return await this.#client.ssoSilent(request);
      } catch (error) {
        this._tractException('login.silent-failed', TelemetryLevel.Warning, {
          exception: error as Error,
          properties: telemetryProperties,
        });
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
      await this.#client.logout({ account: this.account ?? undefined, ...options });
      return true;
    } catch (error) {
      this._tractException('logout.failed', TelemetryLevel.Error, {
        exception: error as Error,
      });
    }
    return false;
  }

  /**
   * Handle authentication redirect
   */
  async handleRedirect(): Promise<AuthenticationResult | null> {
    const result = await this.client.handleRedirectPromise();
    if (result) {
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
    this._trackEvent('createProxyProvider', TelemetryLevel.Debug, {
      properties: {
        version: version,
      },
    });

    // resolve the required version
    const resolvedVersion = resolveVersion(version);

    this._trackEvent('createProxyProvider.version-resolved', TelemetryLevel.Information, {
      properties: resolvedVersion,
    });

    // if the version is not the latest, track a warning
    if (!resolvedVersion.satisfiesLatest) {
      this._trackEvent('createProxyProvider.outdated-version', TelemetryLevel.Warning, {
        properties: resolvedVersion,
      });
    }

    try {
      // create the proxy provider
      return createProxyProvider(this, version);
    } catch (error) {
      this._tractException('createProxyProvider.failed', TelemetryLevel.Error, {
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
  protected _tractException(
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
