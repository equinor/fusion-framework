import type {
  ITelemetryProvider,
  TelemetryItem,
  TelemetryException,
  IMeasurement,
} from '@equinor/fusion-framework-module-telemetry';

import { TelemetryLevel } from '@equinor/fusion-framework-module-telemetry';

import { telemetryExportRequest } from '@equinor/fusion-framework-module';
import { BaseModuleProvider } from '@equinor/fusion-framework-module/provider';

import type { MsalConfig } from './MsalConfigurator.js';
import type { AcquireTokenOptionsLegacy, IMsalProvider } from './MsalProvider.interface.js';
import { createProxyProvider } from './create-proxy-provider.js';
import type {
  AcquireTokenOptions,
  AcquireTokenResult,
  IMsalClient,
  LoginOptions,
  LoginResult,
  LogoutOptions,
} from './MsalClient.interface.js';

import type { AccountInfo, AuthenticationResult } from './types.js';
import { resolveVersion } from './versioning/resolve-version.js';
import { createOperationalTelemetry } from '@equinor/fusion-framework-module-telemetry/utils';
import { version } from './version.js';
import type { MsalModuleVersion } from './static.js';

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
  /** Safe operational outcomes; never carries accounts, scopes, codes, tokens or raw errors. */
  #operational = createOperationalTelemetry('msal');
  #authCode?: string;
  #loginHint?: string;

  /**
   * Default OAuth scopes used when the caller provides no scopes.
   *
   * Resolves to the app's Entra ID configured permissions via the `/.default` scope.
   *
   * @returns The default OAuth scopes derived from the configured client ID.
   */
  get defaultScopes(): string[] {
    const clientId = this.#client.clientId;
    return clientId ? [`${clientId}/.default`] : [];
  }

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
   *
   * @returns The underlying MSAL client instance.
   */
  get client(): IMsalClient {
    return this.#client;
  }

  /**
   * The currently authenticated account.
   *
   * Returns the active account if a user is authenticated, or null if no user is logged in.
   * This is a shorthand for `client.getActiveAccount()`.
   *
   * @returns The currently authenticated account, or `null` if no user is logged in.
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
    this.#operational.connect(config.telemetry?.provider);
    // In-flight flows must not report into a torn-down telemetry host.
    this._addTeardown(() => this.#operational.disconnect());
    this.#loginHint = config.loginHint;

    // Extract auth code from config if present
    // This will be used during initialize to exchange for tokens
    this.#authCode = config.authCode?.trim() || undefined;

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
   *
   * @throws {Error} If auth code exchange requires a client ID but none is configured.
   */
  async initialize(): Promise<void> {
    // Guard: skip authentication when running inside MSAL's hidden iframe.
    // MSAL uses a hidden iframe for silent token renewal (acquireTokenSilent).
    // The iframe loads the app URL, which would re-initialize MSAL and attempt
    // loginRedirect(), causing the "block_iframe_reload" error.  Detect this
    // by checking if we're in an iframe and the URL contains MSAL's hash params.
    if (typeof window !== 'undefined' && window !== window.parent) {
      // Running inside an iframe — let the parent handle authentication.
      // Still initialize the client so handleRedirectPromise can process
      // the auth response and post it back to the parent frame.
      await this.#client.initialize();
      await this.#client.handleRedirectPromise();
      return;
    }

    const measurement = this._trackMeasurement('initialize', TelemetryLevel.Debug);
    // Initialize the underlying MSAL client first
    await this.#client.initialize();

    // Priority 0: Exchange auth code if provided by backend
    // This must happen before the requiresAuth check so tokens are cached
    if (this.#authCode) {
      const exchangeStarted = performance.now();
      try {
        this._trackEvent('initialize.exchanging-auth-code', TelemetryLevel.Information);

        // Use MSAL's acquireTokenByCode to exchange backend auth code for tokens
        // This follows Microsoft's standard SPA Auth Code Flow pattern
        const clientId = this.#client.clientId;
        // A client ID is required to build the default scope used for the auth code exchange
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
          // Account identifiers are never recorded; the event only marks the transition.
          this._trackEvent('initialize.auth-code-exchanged-account', TelemetryLevel.Information);
        }
        this.#operational.report({
          operation: 'exchange-auth-code',
          outcome: 'success',
          duration: performance.now() - exchangeStarted,
        });
      } catch {
        // Auth code exchange failed - record a sanitized outcome and fall back to standard flows.
        // The original error may describe the code or account, so it is never recorded.
        this.#operational.report({
          operation: 'exchange-auth-code',
          outcome: 'failure',
          duration: performance.now() - exchangeStarted,
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
      // A returned account means the user just completed a redirect-based login
      if (handleRedirectResult?.account) {
        // Successfully authenticated via redirect - set as active account
        // This means the user was redirected to Microsoft and came back authenticated
        this.#client.setActiveAccount(handleRedirectResult.account);
        this._trackEvent('initialize.active-account-set-by-callback', TelemetryLevel.Information);
      } else if (!this.#client.hasValidClaims) {
        // Priority 2: No valid session found - attempt automatic login
        // This handles first-time app load when no authentication state exists
        // Note: Using default scopes here as we don't know what scopes the app needs yet
        // App should call acquireToken with actual scopes after initialization
        const loginResult = await this.login({ request: { scopes: this.defaultScopes } });
        // Only set the active account when the automatic login actually returned one
        if (loginResult?.account) {
          // Automatic login successful - set as active account
          this.#client.setActiveAccount(loginResult.account);
          this._trackEvent('initialize.active-account-set-by-login', TelemetryLevel.Information);
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
  async acquireAccessToken(
    options?: AcquireTokenOptions | AcquireTokenOptionsLegacy,
  ): Promise<string | undefined> {
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
   * @throws {Error} Re-throws any error encountered during token acquisition after tracking it via telemetry.
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
  async acquireToken(
    options?: AcquireTokenOptions | AcquireTokenOptionsLegacy,
  ): Promise<AcquireTokenResult> {
    // Guard: when running inside MSAL's hidden iframe, only attempt silent
    // acquisition.  Interactive flows (redirect/popup) must never be triggered
    // from an iframe — MSAL will throw "block_iframe_reload".
    const inIframe = typeof window !== 'undefined' && window !== window.parent;

    // Determine behavior and silent options, with defaults (redirect and true respectively)
    const behavior = inIframe ? 'redirect' : (options?.behavior ?? 'redirect');

    // When in an iframe, force silent-only to prevent interactive fallback
    const silent = inIframe ? true : (options?.silent ?? true);

    const defaultScopes = this.defaultScopes;

    const inputRequest = options?.request;

    // Determine the account to use for token acquisition, prioritizing request-specific account, then active account
    const account = inputRequest?.account ?? this.account ?? undefined;

    // Extract caller-provided scopes from either new format (request.scopes) or legacy format (scopes)
    const candidateScopes =
      inputRequest?.scopes ?? (options as AcquireTokenOptionsLegacy)?.scopes ?? [];

    const scopes =
      candidateScopes.length > 0 ? candidateScopes : defaultScopes.length > 0 ? defaultScopes : [];

    // Flow flags only; scopes identify the requested resources and are never recorded.
    const telemetryProperties = { behavior, silent };

    // Track usage of deprecated legacy scopes format for migration monitoring
    if ((options as AcquireTokenOptionsLegacy)?.scopes) {
      this._trackEvent('acquireToken.legacy-scopes-provided', TelemetryLevel.Warning, {
        properties: telemetryProperties,
      });
    }

    // Handle empty scopes - currently monitoring for telemetry, will throw in future
    if (candidateScopes.length === 0) {
      // Fall back to the client-id-derived default scope when one is available
      if (defaultScopes.length > 0) {
        this._trackEvent('acquireToken.missing-scope.defaulted', TelemetryLevel.Warning, {
          properties: telemetryProperties,
        });
      } else {
        const exception = new Error(
          'Empty scopes provided and clientId is missing for default scope',
        );
        this._trackException('acquireToken.missing-scope', TelemetryLevel.Warning, {
          exception,
          properties: telemetryProperties,
        });
        // TODO(#5113): throw exception when sufficient metrics are collected
        // This allows us to monitor how often empty scopes are provided before enforcing validation
      }
    }

    // Token acquisition for telemetry delivery belongs to the export and is never recorded,
    // otherwise each export would produce a record to export in turn.
    const operational =
      options && telemetryExportRequest in options ? undefined : this.#operational;
    const started = performance.now();
    try {
      // Merge account, original request options, and resolved scopes.
      // Account ensures context awareness, request preserves custom options, scopes uses resolved value.
      const result = await this.#client.acquireToken({
        behavior,
        silent,
        request: { ...inputRequest, account, scopes },
      });
      operational?.report({
        operation: 'acquire-token',
        outcome: 'success',
        duration: performance.now() - started,
      });
      return result;
    } catch (error) {
      // Inside MSAL's hidden iframe, silent acquisition may fail and the client
      // would fall back to acquireTokenRedirect which throws "block_iframe_reload".
      // Suppress this — the parent frame handles interactive auth, so it is not a failure.
      operational?.report({
        operation: 'acquire-token',
        outcome: inIframe || isUserCancellation(error) ? 'cancelled' : 'failure',
        duration: performance.now() - started,
      });
      // The hidden iframe defers to the parent frame instead of rethrowing.
      if (inIframe) {
        this._trackEvent('acquireToken.suppressed-in-iframe', TelemetryLevel.Debug, {
          properties: telemetryProperties,
        });
        return undefined;
      }
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
    // Guard: never attempt interactive login inside MSAL's hidden iframe.
    if (typeof window !== 'undefined' && window !== window.parent) {
      return undefined;
    }

    const { behavior = 'redirect', silent = true, request } = options;

    request.loginHint ??=
      this.#loginHint ?? this.account?.username ?? this.account?.loginHint ?? undefined;

    const defaultScopes = this.defaultScopes;

    // Fallback to app default scope when possible; empty scopes tracked for monitoring
    if (!request.scopes || request.scopes.length === 0) {
      request.scopes = defaultScopes.length > 0 ? defaultScopes : [];
    }

    // Determine if silent login is possible based on available account/hint information
    // Silent login requires either an account object or a loginHint to work
    const canLoginSilently = silent && (request.account || request.loginHint);

    // Flow flags only; scopes identify the requested resources and are never recorded.
    const telemetryProperties = { behavior, silent, canLoginSilently: Boolean(canLoginSilently) };

    // Default to active account if no account/hint provided in request
    // This allows silent login to work automatically with existing authentication state
    request.account ??= this.account ?? undefined;

    // If scopes are still empty here, we couldn't derive a default scope (e.g. missing clientId).
    // Track for monitoring; behavior will be enforced once we have sufficient metrics.
    if (request.scopes.length === 0) {
      this._trackEvent('login.missing-scope', TelemetryLevel.Warning, {
        properties: telemetryProperties,
      });
    }

    this._trackEvent('login', TelemetryLevel.Information, {
      properties: telemetryProperties,
    });

    const started = performance.now();
    try {
      const result = await this.#login(request, behavior, Boolean(canLoginSilently));
      this.#operational.report({
        operation: 'login',
        outcome: 'success',
        duration: performance.now() - started,
      });
      return result;
    } catch (error) {
      this.#operational.report({
        operation: 'login',
        outcome: isUserCancellation(error) ? 'cancelled' : 'failure',
        duration: performance.now() - started,
      });
      throw error;
    }
  }

  /**
   * Runs the silent-then-interactive login flow measured by {@link login}.
   * @param request - Resolved login request.
   * @param behavior - Interactive fallback behavior.
   * @param canLoginSilently - Whether a silent attempt is possible.
   * @returns The login result, or `undefined` for a redirect that navigates away.
   * @throws The original MSAL error, or an error for an unsupported behavior.
   */
  async #login(
    request: LoginOptions['request'] & { scopes: string[] },
    behavior: LoginOptions['behavior'],
    canLoginSilently: boolean,
  ): Promise<LoginResult> {
    // Attempt silent authentication first if conditions are met
    // This provides better UX by avoiding unnecessary popups/redirects
    if (canLoginSilently) {
      try {
        return await this.#client.ssoSilent(request);
      } catch {
        // Silent login failed - a recoverable degradation, recorded without the original error,
        // which may contain account hints. Fall through to interactive authentication.
        this.#operational.report({
          notification: true,
          operation: 'silent-login-fallback',
          outcome: 'failure',
          level: TelemetryLevel.Warning,
        });
      }
    }

    // Perform interactive authentication based on specified behavior
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
    // Redirect URIs can carry paths and query data, so the event only marks the transition.
    this._trackEvent('logout', TelemetryLevel.Information);

    const started = performance.now();
    try {
      // Logout the specific account (or current account if none specified)
      await this.#client.logout({ account: this.account ?? undefined, ...options });
      this.#operational.report({
        operation: 'logout',
        outcome: 'success',
        duration: performance.now() - started,
      });
      return true; // Success
    } catch {
      // Logout failed - record a sanitized outcome but don't throw to avoid breaking app flow
      this.#operational.report({
        operation: 'logout',
        outcome: 'failure',
        duration: performance.now() - started,
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
    const started = performance.now();
    try {
      // Process any pending redirect from authentication flow
      const result = await this.client.handleRedirectPromise();
      // Processing ran even without a pending redirect, so success is measured either way;
      // otherwise failures would be over-represented in the outcome ratio.
      this.#operational.report({
        operation: 'handle-redirect',
        outcome: 'success',
        duration: performance.now() - started,
      });
      // The legacy event marks only a completed redirect flow, without account identifiers.
      if (result) {
        this._trackEvent('handleRedirect.success', TelemetryLevel.Information);
      }
      return result;
    } catch (error) {
      // The response could not be processed; standard authentication continues.
      this.#operational.report({
        operation: 'handle-redirect',
        outcome: isUserCancellation(error) ? 'cancelled' : 'failure',
        duration: performance.now() - started,
      });
      return null;
    }
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
   * @template T - The provider interface type expected by the target version.
   * @throws {Error} If the requested version cannot be resolved or the proxy fails to create.
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

/**
 * Detects MSAL's user-cancellation error, an intended stop rather than a failure.
 * @param error - Error thrown by an MSAL flow.
 * @returns `true` when the user closed or cancelled the interaction.
 */
function isUserCancellation(error: unknown): boolean {
  return (error as { errorCode?: unknown } | undefined)?.errorCode === 'user_cancelled';
}
