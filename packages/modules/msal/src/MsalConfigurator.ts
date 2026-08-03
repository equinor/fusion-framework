import {
  BaseConfigBuilder,
  type ConfigBuilderCallbackArgs,
} from '@equinor/fusion-framework-module';
import { TelemetryLevel } from '@equinor/fusion-framework-module-telemetry';
import { CacheLookupPolicy, LogLevel } from '@azure/msal-browser';

import type { ITelemetryProvider } from '@equinor/fusion-framework-module-telemetry';
import type { IMsalProvider } from './MsalProvider.interface';
import { MsalClient, type MsalClientConfig, type IMsalClient } from './MsalClient';
import { createClientLogCallback } from './create-client-log-callback';
import { version } from './version';
import { MsalConfigSchema, type MsalConfig } from './msal-config-schema';

export {
  MsalConfigSchema,
  type MsalConfig,
  type MsalConfigExtension,
} from './msal-config-schema';
export { TelemetryConfigSchema, type TelemetryConfig } from './telemetry-config-schema';

/**
 * Configuration builder for MSAL v4 authentication module.
 *
 * This configurator provides a fluent API for setting up Microsoft Authentication Library
 * configuration with support for MSAL v4 features and breaking changes.
 *
 * @example
 * ```typescript
 * const configurator = new MsalConfigurator();
 * configurator.setClient(new AuthClient('your-tenant-id', 'your-client-id'));
 * configurator.setRequiresAuth(true);
 * ```
 */
export class MsalConfigurator extends BaseConfigBuilder<MsalConfig> {
  #msalConfig?: MsalClientConfig;
  #client?: IMsalClient;

  /**
   * The MSAL module version being configured.
   *
   * @default Latest
   * @returns The configured MSAL module version.
   */
  public get version(): string {
    return version;
  }

  /**
   * Creates a new MSAL configurator instance.
   *
   * Sets up default configuration including version and telemetry provider integration.
   */
  constructor() {
    super();
    // Set default version
    this._set('version', async () => this.version);
    // Auto-detect and integrate telemetry module if available
    this._set('telemetry.provider', async (args) => {
      // Only resolve the telemetry instance when the telemetry module is registered
      if (args.hasModule('telemetry')) {
        const telemetry = await args.requireInstance('telemetry');
        return telemetry;
      }
    });
    // Always resolve the configured client instance through the builder.
    // This keeps the client getter live and avoids re-registering the same config key.
    this._set('client', async () => this.#client);
    // Default cache lookup policy to AccessTokenAndRefreshToken to avoid iframe fallback delays
    this._set('cacheLookupPolicy', async () => CacheLookupPolicy.AccessTokenAndRefreshToken);
  }

  /**
   * Sets the MSAL client configuration for authentication.
   *
   * This method stores the configuration which will be used to create an MSAL client
   * instance during module initialization. The client will be auto-created if not provided
   * via `setClient`.
   *
   * @param config - Client configuration object with MSAL settings (client ID, tenant ID, etc.)
   * @returns The configurator instance for method chaining
   *
   * @example
   * ```typescript
   * configurator.setClientConfig({
   *   auth: {
   *     clientId: 'your-client-id',
   *     tenantId: 'your-tenant-id'
   *   }
   * });
   * ```
   */
  setClientConfig(config?: MsalClientConfig): this {
    this.#msalConfig = config;
    return this;
  }

  /**
   * Returns the client configuration declared through
   * {@link MsalConfigurator.setClientConfig | setClientConfig}, if any.
   *
   * @remarks
   * This is the configuration as declared, not the resolved one a client is
   * built from — see
   * {@link MsalConfigurator._createClientConfig | _createClientConfig} for that.
   * Reading it is how a subclass can tell "nothing was declared" apart from
   * "declared, and here it is", without re-deriving that from a resolved value.
   *
   * @returns The declared client configuration, or `undefined` when none was declared.
   */
  public getClientConfig(): MsalClientConfig | undefined {
    return this.#msalConfig;
  }

  /**
   * Sets the cache lookup policy used for every silent token acquisition.
   *
   * Controls whether MSAL falls back to a hidden iframe when the refresh token
   * fails. Defaults to `CacheLookupPolicy.AccessTokenAndRefreshToken`, which skips
   * the iframe step and fails immediately with `InteractionRequiredAuthError` when
   * the refresh token is revoked — avoiding the ~10–20 s `monitor_window_timeout`
   * delay caused by MSAL's built-in iframe fallback.
   *
   * Set to `CacheLookupPolicy.Default` to restore MSAL's full waterfall:
   * cache → refresh token → iframe.
   *
   * @param policy - Cache lookup policy to apply
   * @returns The configurator instance for method chaining
   *
   * @example
   * ```typescript
   * import { CacheLookupPolicy } from '@azure/msal-browser';
   *
   * // Restore MSAL's built-in iframe fallback (not recommended for most apps)
   * configurator.setCacheLookupPolicy(CacheLookupPolicy.Default);
   * ```
   */
  setCacheLookupPolicy(policy: CacheLookupPolicy | undefined): this {
    this._set('cacheLookupPolicy', async () => policy);
    return this;
  }

  /**
   * Sets a backend-issued authorization code for token exchange.
   *
   * This enables the MSAL module to exchange a backend-generated auth code for tokens
   * during initialization, allowing users to be automatically signed in without triggering
   * an interactive MSAL login flow. The auth code is exchanged before the requiresAuth check,
   * so tokens are cached and no login prompt appears.
   *
   * This follows Microsoft's standard SPA Auth Code Flow pattern and is compatible with
   * MSAL Browser's acquireTokenByCode() method.
   *
   * @param authCode - The authorization code issued by the backend, or undefined to clear/reset it
   * @returns The configurator instance for method chaining
   *
   * @example
   * ```typescript
   * // Backend provides auth code in HTML/config
   * const config = { auth: { code: getAuthCodeFromBackend() } };
   * configurator.setAuthCode(config.auth.code);
   *
   * // Clear previously configured auth code
   * configurator.setAuthCode(undefined);
   * ```
   *
   * @remarks
   * - Auth codes are single-use and short-lived (typically 5-10 minutes)
   * - The exchange happens during module initialization before requiresAuth check
   * - If exchange fails, the provider falls back to standard MSAL authentication flows
   * - Passing undefined, empty, or whitespace-only values clears the configured auth code
   * - Requires backend to be configured with SPA Auth Code support
   */
  setAuthCode(authCode?: string): this {
    const normalizedAuthCode = authCode?.trim() || undefined;
    this._set('authCode', async () => normalizedAuthCode);
    return this;
  }

  /**
   * Sets whether authentication is required for the application.
   *
   * When set to true, the application will attempt automatic login during initialization
   * if no valid authentication session exists. When false, authentication is optional
   * and must be triggered manually.
   *
   * @param requiresAuth - Whether authentication is mandatory for the application
   * @returns The configurator instance for method chaining
   *
   * @example
   * ```typescript
   * // Require authentication on app load
   * configurator.setRequiresAuth(true);
   *
   * // Make authentication optional
   * configurator.setRequiresAuth(false);
   * ```
   */
  setRequiresAuth(requiresAuth: boolean): this {
    this._set('requiresAuth', async () => requiresAuth);
    return this;
  }

  /**
   * Sets a default login hint for authentication flows.
   *
   * The login hint is used to pre-fill the username during authentication and
   * enables silent SSO when no account is available.
   *
   * @param loginHint - The preferred username/email to use as login hint
   * @returns The configurator instance for method chaining
   *
   * @example
   * ```typescript
   * configurator.setLoginHint('user@company.com');
   * ```
   */
  setLoginHint(loginHint?: string): this {
    this._set('loginHint', async () => loginHint);
    return this;
  }

  /**
   * Sets a pre-configured MSAL provider instance directly.
   *
   * @deprecated Since version 5.1.0. Use {@link MsalConfigurator.setClient | setClient} instead.
   *
   * @param provider - Pre-configured provider instance, or undefined to clear
   * @returns The configurator instance for method chaining
   */
  setProvider(provider?: IMsalProvider): this {
    this._set('provider', async () => provider);
    return this;
  }

  /**
   * Sets a pre-configured MSAL client instance.
   *
   * This method allows you to provide an already-instantiated MSAL client rather than
   * letting the configurator create one from configuration. Useful when you need
   * custom client configuration outside the standard configurator options.
   *
   * @param client - Pre-configured MSAL client instance
   * @returns The configurator instance for method chaining
   *
   * @example
   * ```typescript
   * const customClient = new MsalClient(customConfig);
   * configurator.setClient(customClient);
   * ```
   */
  setClient(client: IMsalClient): this {
    this.#client = client;
    return this;
  }

  /**
   * Returns the currently configured MSAL client, if one has been set.
   *
   * @remarks
   * This is useful in tests when a mock client has been provided and the test
   * wants to adjust its state after it has been assigned to the configurator.
   *
   * @returns The configured client, or `undefined` when none has been set.
   */
  public getClient(): IMsalClient | undefined {
    return this.#client;
  }

  /**
   * Sets telemetry provider for MSAL authentication events.
   *
   * This allows MSAL authentication events to be tracked through the framework's
   * telemetry system. If not provided, telemetry module will be auto-detected if
   * available in the framework configuration.
   *
   * @param telemetry - Telemetry provider instance or undefined to disable telemetry
   * @returns The configurator instance for method chaining
   */
  setTelemetry(telemetry: ITelemetryProvider | undefined): this {
    this._set('telemetry.provider', async () => telemetry);
    return this;
  }

  /**
   * Sets optional metadata to be included on all MSAL telemetry events.
   *
   * @deprecated Use {@link MsalConfigurator.setTelemetry | setTelemetry} instead.
   *
   * @param metadata - Key-value metadata to attach to telemetry events, or undefined to clear
   * @returns The configurator instance for method chaining
   */
  setTelemetryMetadata(metadata: Record<string, unknown> | undefined): this {
    this._set('telemetry.metadata', async () => metadata);
    return this;
  }

  /**
   * Sets the telemetry scope for MSAL authentication events.
   *
   * The scope is used to categorize and filter telemetry events in the telemetry system.
   * Default scope is ['framework', 'authentication'].
   *
   * @param scope - Array of scope identifiers for telemetry categorization
   * @returns The configurator instance for method chaining
   *
   * @example
   * ```typescript
   * configurator.setTelemetryScope(['custom', 'auth', 'msal']);
   * ```
   */
  setTelemetryScope(scope: string[]): this {
    this._set('telemetry.scope', async () => scope);
    return this;
  }

  /**
   * Processes and validates the configuration.
   *
   * @param rawConfig - Raw configuration object
   * @param init - The builder arguments, carrying the host reference when hoisted
   * @returns Processed and validated configuration
   */
  async _processConfig(
    rawConfig: MsalConfig,
    init?: ConfigBuilderCallbackArgs,
  ): Promise<MsalConfig> {
    // Validate and coerce configuration using Zod schema
    const config = await MsalConfigSchema.parseAsync(rawConfig);

    // Auto-create client if no client instance was supplied
    // This allows users to provide configuration without manually instantiating the client
    // A hoisted module authenticates through the host's provider, so any client built here
    // would be discarded — gate it here rather than in `_createClient`, so a substituted
    // client (see `MsalMockConfigurator`) cannot shadow the host's signed-in user
    if (!config.client && !this._isHoisted(init)) {
      config.client = await this._createClient(config, init);
    }

    return config;
  }

  /**
   * Creates the client to authenticate through, when none was supplied.
   *
   * @remarks
   * Called by {@link MsalConfigurator._processConfig | _processConfig} only when
   * no client was set, so a client supplied through
   * {@link MsalConfigurator.setClient | setClient} always wins. It is likewise
   * not called when the module is hoisted onto a host application's provider —
   * see {@link MsalConfigurator._isHoisted | _isHoisted}.
   *
   * This is the seam for authenticating through something other than Entra ID.
   * Overriding it replaces only the client, leaving the builder, the schema
   * validation and `MsalProvider` untouched — which is how
   * `MsalMockConfigurator` substitutes an in-process client for tests.
   *
   * An override normally builds from
   * {@link MsalConfigurator._createClientConfig | _createClientConfig}, so it
   * receives the same fully-resolved {@link MsalClientConfig} the real client is
   * built from rather than re-deriving it.
   *
   * Returning `undefined` is legitimate and means "there is nothing to build a
   * client from", which leaves the module without one.
   *
   * @param config - The validated configuration the client is built from.
   * @param init - The builder arguments, carrying the host reference when hoisted.
   * @returns The client, or `undefined` when there is nothing to build one from.
   */
  protected async _createClient(
    config: MsalConfig,
    _init?: ConfigBuilderCallbackArgs,
  ): Promise<IMsalClient | undefined> {
    const clientConfig = this._createClientConfig(config);
    // A client can be omitted for a hoisted module or an intentionally incomplete setup.
    if (!clientConfig) {
      return undefined;
    }

    // Instantiate MSAL client with fully configured options
    return new MsalClient(clientConfig);
  }

  /**
   * Whether this module is hoisted onto a host application's authentication.
   *
   * @remarks
   * When an application runs inside a host — a portal loading an app, or an app
   * loading a widget — the module initializer returns a proxy of the host's
   * provider instead of building its own (see the host-provider branch of the
   * module initializer). A client built during configuration would therefore be
   * constructed and immediately discarded.
   *
   * Detecting this during configuration lets the configurator skip building a
   * client entirely, which matters most for substituted clients: a mock client
   * built here would otherwise silently shadow the host's real signed-in user.
   *
   * @param init - The builder arguments, carrying the host reference when hoisted.
   * @returns `true` when a host provider will be used instead of a locally built client.
   */
  protected _isHoisted(init?: ConfigBuilderCallbackArgs): boolean {
    return !!(init?.ref as { auth?: IMsalProvider } | undefined)?.auth;
  }

  /**
   * Resolves the full MSAL client configuration to build a client from.
   *
   * @remarks
   * Applies the defaults a client is expected to be built with — authority
   * derived from the tenant, cache location, telemetry-backed logging and the
   * configured cache lookup policy.
   *
   * Kept separate from {@link MsalConfigurator._createClient | _createClient} so
   * that substituting the client does not also mean re-implementing this
   * resolution. `MsalMockConfigurator` relies on it to hand its mock client the
   * very same configuration the real client would have received.
   *
   * @param config - The validated configuration.
   * @returns The client configuration, or `undefined` when none was declared.
   */
  protected _createClientConfig(config: MsalConfig): MsalClientConfig | undefined {
    const declared = this.#msalConfig;
    // Do not construct a client when configuration has not supplied client settings.
    if (!declared) {
      return undefined;
    }

    config.telemetry.provider?.trackEvent({
      name: 'module-msal.configurator._processConfig.creating-client',
      level: TelemetryLevel.Debug,
      scope: config.telemetry.scope,
      metadata: { ...config.telemetry.metadata, clientConfig: declared },
    });

    // Copied rather than enriched in place, so the object a caller passed to
    // `setClientConfig` is never rewritten behind its back — a caller may well
    // be reusing or asserting on it
    const clientConfig: MsalClientConfig = {
      ...declared,
      auth: { ...declared.auth },
      // Default to localStorage: MSAL supports sessionStorage too, but
      // localStorage is the standard for persistent auth in browsers
      cache: declared.cache ?? { cacheLocation: 'localStorage' },
    };

    // Auto-generate authority URL from tenant ID if not explicitly provided
    // This simplifies configuration for most common cases
    if (!clientConfig.auth.authority && clientConfig.auth.tenantId) {
      clientConfig.auth.authority = `https://login.microsoftonline.com/${clientConfig.auth.tenantId}`;
    }

    // Integrate framework telemetry with MSAL logging system
    // This allows MSAL events to flow through the framework's telemetry pipeline
    if (!clientConfig.system?.loggerOptions && config.telemetry?.provider) {
      const { provider, metadata, scope } = config.telemetry;

      provider.trackEvent({
        name: 'module-msal.configurator._processConfig.client-telemetry-connected',
        level: TelemetryLevel.Debug,
        scope,
        metadata,
      });

      clientConfig.system = {
        ...clientConfig.system,
        loggerOptions: {
          // Only log PII in development to protect user privacy in production
          piiLoggingEnabled: process.env.NODE_ENV === 'development',
          // Bridge MSAL log events to framework telemetry system
          loggerCallback: createClientLogCallback(provider, metadata, [...scope, '3rd-party']),
          // Use Warning level by default - captures errors and warnings without being verbose
          logLevel: LogLevel.Warning,
          // Preserve any user-provided logger options (allows customization)
          ...clientConfig.system?.loggerOptions,
        },
      };
    }

    // Apply silent cache lookup policy if configured
    if (config.cacheLookupPolicy !== undefined) {
      clientConfig.cacheLookupPolicy = config.cacheLookupPolicy;
    }

    return clientConfig;
  }
}
