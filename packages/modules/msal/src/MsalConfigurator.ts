import z from 'zod';
import { BaseConfigBuilder } from '@equinor/fusion-framework-module';
import { MsalModuleVersion } from './static';
import semver from 'semver';
import type { IMsalProvider } from './MsalProvider.interface';
import {
  TelemetryLevel,
  type ITelemetryProvider,
} from '@equinor/fusion-framework-module-telemetry';
import { MsalClient, type MsalClientConfig, type IMsalClient } from './MsalClient';
import { createClientLogCallback } from './create-client-log-callback';
import { LogLevel } from '@azure/msal-browser';
import { version } from './version';

/**
 * Zod schema for telemetry configuration validation.
 *
 * @internal
 */
const TelemetryConfigSchema = z.object({
  provider: z.custom<ITelemetryProvider>().optional(),
  metadata: z.record(z.string(), z.unknown()).optional().default({
    module: 'msal',
    version,
  }),
  scope: z.array(z.string()).optional().default(['framework', 'authentication']),
});

/**
 * Telemetry configuration for MSAL module.
 *
 * This configuration controls how authentication events are tracked and logged
 * through the framework's telemetry system.
 */
export type TelemetryConfig = z.infer<typeof TelemetryConfigSchema>;

/**
 * Zod schema for MSAL module configuration validation.
 *
 * @internal
 */
const MsalConfigSchema = z.object({
  client: z.custom<IMsalClient>(),
  provider: z.custom<IMsalProvider>().optional(),
  requiresAuth: z.boolean().optional(),
  redirectUri: z.string().optional(),
  version: z.string().transform((x: string) => String(semver.coerce(x))),
  telemetry: TelemetryConfigSchema,
});

/**
 * Complete configuration object for MSAL authentication module.
 *
 * This type represents the full configuration including client setup, authentication
 * requirements, telemetry, and version information.
 */
export type MsalConfig = z.infer<typeof MsalConfigSchema>;

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

  /**
   * The MSAL module version being configured.
   *
   * @default Latest
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
      if (args.hasModule('telemetry')) {
        const telemetry = await args.requireInstance('telemetry');
        return telemetry;
      }
    });
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
   * @deprecated - since version 5.1.0, use setClient instead
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
    this._set('client', async () => client);
    return this;
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
   * @deprecated Use setTelemetry({ metadata }) instead
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
   * @param config - Raw configuration object
   * @returns Processed and validated configuration
   */
  async _processConfig(rawConfig: MsalConfig): Promise<MsalConfig> {
    // Validate and coerce configuration using Zod schema
    const config = await MsalConfigSchema.parseAsync(rawConfig);

    // Auto-create client if config provided but no client instance
    // This allows users to provide configuration without manually instantiating the client
    if (!config.client && !!this.#msalConfig) {
      const clientConfig = this.#msalConfig;

      config.telemetry.provider?.trackEvent({
        name: 'module-msal.configurator._processConfig.creating-client',
        level: TelemetryLevel.Debug,
        scope: config.telemetry.scope,
        metadata: { ...config.telemetry.metadata, clientConfig },
      });

      // Auto-generate authority URL from tenant ID if not explicitly provided
      // This simplifies configuration for most common cases
      if (!clientConfig.auth.authority && clientConfig.auth.tenantId) {
        clientConfig.auth.authority = `https://login.microsoftonline.com/${clientConfig.auth.tenantId}`;
      }

      // Set default cache location to localStorage for browser environments
      // MSAL supports sessionStorage as well, but localStorage is the standard for persistent auth
      if (!clientConfig.cache) {
        clientConfig.cache = { cacheLocation: 'localStorage' };
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
      // Instantiate MSAL client with fully configured options
      config.client = new MsalClient(clientConfig);
    }

    return config;
  }
}
