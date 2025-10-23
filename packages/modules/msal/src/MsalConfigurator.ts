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

const TelemetryConfigSchema = z.object({
  provider: z.custom<ITelemetryProvider>().optional(),
  metadata: z.record(z.string(), z.unknown()).optional().default({
    module: 'msal',
    version: MsalModuleVersion.Latest,
  }),
  scope: z.array(z.string()).optional().default(['framework', 'authentication']),
});

export type TelemetryConfig = z.infer<typeof TelemetryConfigSchema>;

const MsalConfigSchema = z.object({
  client: z.custom<IMsalClient>(),
  provider: z.custom<IMsalProvider>().optional(),
  requiresAuth: z.boolean().optional(),
  redirectUri: z.string().optional(),
  version: z.string().transform((x: string) => String(semver.coerce(x))),
  telemetry: TelemetryConfigSchema,
});

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

  public version = MsalModuleVersion.Latest as const;

  constructor() {
    super();
    this._set('version', async () => this.version);
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
   * @param config - Client configuration object with MSAL settings
   */
  setClientConfig(config?: MsalClientConfig): this {
    this.#msalConfig = config;
    return this;
  }

  /**
   * Sets whether authentication is required for the application.
   *
   * @param requiresAuth - Whether authentication is mandatory
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
   * @param client - Pre-configured PublicClientApplication instance
   */
  setClient(client: IMsalClient): this {
    this._set('client', async () => client);
    return this;
  }

  /**
   * Sets telemetry configuration for MSAL authentication.
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
    const config = await MsalConfigSchema.parseAsync(rawConfig);

    // if no client is provided, but a client config is provided, create a new client
    if (!config.client && !!this.#msalConfig) {
      const clientConfig = this.#msalConfig;

      config.telemetry.provider?.trackEvent({
        name: 'module-msal.configurator._processConfig.creating-client',
        level: TelemetryLevel.Debug,
        scope: config.telemetry.scope,
        metadata: { ...config.telemetry.metadata, clientConfig },
      });

      // if the authority is not explicitly set, use the tenant ID to create a default authority
      if (!clientConfig.auth.authority && clientConfig.auth.tenantId) {
        clientConfig.auth.authority = `https://login.microsoftonline.com/${clientConfig.auth.tenantId}`;
      }

      // if the cache options are not explicitly set, use the default cache location
      if (!clientConfig.cache) {
        clientConfig.cache = { cacheLocation: 'localStorage' };
      }

      // if the logger options are not explicitly set, use the telemetry provider to create a logger callback
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
            // by default, log PII in development
            piiLoggingEnabled: process.env.NODE_ENV === 'development',
            // by default, use the createClientLogCallback function to create a logger callback
            loggerCallback: createClientLogCallback(provider, metadata, [...scope, '3rd-party']),
            logLevel: LogLevel.Warning,
            // merge the existing logger options
            ...clientConfig.system?.loggerOptions,
          },
        };
      }
      // create a new MSAL client instance
      config.client = new MsalClient(clientConfig);
    }

    return config;
  }
}
