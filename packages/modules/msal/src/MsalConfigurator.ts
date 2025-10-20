import z from 'zod';
import { BaseConfigBuilder } from '@equinor/fusion-framework-module';
import { MsalModuleVersion } from './static';
import semver from 'semver';
import type { IMsalProvider } from './MsalProvider.interface';
import type { ITelemetryProvider } from '@equinor/fusion-framework-module-telemetry';
import { MsalClient, type MsalClientConfig, type IMsalClient } from './MsalClient';

const MsalConfigSchema = z.object({
  client: z.custom<IMsalClient>(),
  provider: z.custom<IMsalProvider>().optional(),
  requiresAuth: z.boolean().optional(),
  redirectUri: z.string().optional(),
  version: z.string().transform((x: string) => String(semver.coerce(x))),
  telemetry: z.custom<ITelemetryProvider>().optional(),
  telemetryMetadata: z.record(z.string(), z.unknown()).optional(),
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
    this._set('telemetry', async (args) => {
      if (args.hasModule('telemetry')) {
        const telemetry = await args.requireInstance('telemetry');
        return telemetry;
      }
      return undefined;
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
   * Sets an optional telemetry provider used for emitting authentication measurements and events.
   */
  setTelemetry(telemetry: ITelemetryProvider | undefined): this {
    this._set('telemetry', async () => telemetry);
    return this;
  }

  /**
   * Sets optional metadata to be included on all MSAL telemetry events.
   */
  setTelemetryMetadata(metadata: Record<string, unknown> | undefined): this {
    this._set('telemetryMetadata', async () => metadata);
    return this;
  }

  /**
   * Processes and validates the configuration.
   *
   * @param config - Raw configuration object
   * @returns Processed and validated configuration
   */
  async _processConfig(config: MsalConfig): Promise<MsalConfig> {
    if (!config.client && !!this.#msalConfig) {
      const clientConfig = this.#msalConfig;
      if (!clientConfig.auth.authority && clientConfig.auth.tenantId) {
        clientConfig.auth.authority = `https://login.microsoftonline.com/${clientConfig.auth.tenantId}`;
      }
      if (!clientConfig.cache) {
        clientConfig.cache = { cacheLocation: 'localStorage' };
      }
      config.client = new MsalClient(clientConfig);
    }
    return MsalConfigSchema.parseAsync(config);
  }
}
