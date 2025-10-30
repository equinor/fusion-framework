import {
  type Module,
  type IModulesConfigurator,
  SemanticVersion,
} from '@equinor/fusion-framework-module';

import { MsalConfigurator } from './MsalConfigurator';
import { MsalProvider, type IMsalProvider } from './MsalProvider';
import type { MsalClientConfig } from './MsalClient';

import { version } from './version';

/**
 * MSAL authentication module configuration.
 *
 * This module provides Microsoft Authentication Library (MSAL) integration for the
 * Fusion Framework, supporting MSAL v4 with backward compatibility for v2 applications.
 */
export type MsalModule = Module<'auth', IMsalProvider, MsalConfigurator, [MsalModule]>;

/**
 * MSAL authentication module definition.
 *
 * This module manages authentication providers with the following initialization flow:
 * 1. Check for custom provider configuration
 * 2. Check for existing provider in parent module (for proxy compatibility)
 * 3. Create new provider with client configuration
 *
 * @remarks
 * The module supports proxy providers for version compatibility, allowing v4 implementations
 * to work with v2-compatible code during migration periods.
 */
export const module: MsalModule = {
  name: 'auth',
  version: new SemanticVersion(version),
  configure: () => new MsalConfigurator(),
  initialize: async (init) => {
    const config = await init.config.createConfigAsync(init);

    // Priority 1: Use custom provider if explicitly configured
    if (config.provider) {
      return config.provider;
    }

    // Priority 2: Check if provider exists in parent module (proxy compatibility)
    // This allows child applications to reuse parent's authentication provider
    const hostProvider = init.ref?.auth;
    if (hostProvider) {
      try {
        const proxyProvider = hostProvider.createProxyProvider(config.version);
        return proxyProvider;
      } catch (error) {
        console.error('MsalModule::Failed to create proxy provider', error);
        // Fallback to host provider to prevent app breakage during migration
        // TODO: Consider throwing error instead once all apps are migrated to v4
        return hostProvider;
      }
    }

    // Priority 3: Validate client configuration is provided
    if (!config.client) {
      throw new Error(
        'Client configuration is required when provider is not in the parent module nor defined',
      );
    }

    // Create new MSAL provider instance
    const provider = new MsalProvider(config);

    // Initialize the provider (handles redirect callbacks, SSO, etc.)
    await provider.initialize();

    return provider;
  },
};

/**
 * Configuration function type for MSAL module setup.
 *
 * This function receives a builder object with methods to configure the MSAL client
 * and authentication requirements.
 */
export type AuthConfigFn = (builder: {
  /**
   * Set MSAL client configuration
   * @param config - Client configuration with tenant ID, client ID, etc.
   */
  setClientConfig: (config: MsalClientConfig) => void;
  /**
   * Set whether authentication is required for the application
   * @param requiresAuth - If true, app will attempt automatic login on initialization
   */
  setRequiresAuth: (requiresAuth: boolean) => void;
}) => void;

/**
 * Enables MSAL authentication module in the framework.
 *
 * This is a convenience function that adds the MSAL module configuration to the
 * framework configurator with optional configuration callback.
 *
 * @param configurator - The framework modules configurator instance
 * @param configure - Optional configuration callback for MSAL setup
 *
 * @example
 * ```typescript
 * enableMSAL(frameworkConfigurator, (builder) => {
 *   builder.setClientConfig({
 *     auth: { clientId: 'your-client-id', tenantId: 'your-tenant-id' }
 *   });
 *   builder.setRequiresAuth(true);
 * });
 * ```
 */
export const enableMSAL = (
  // @biome-ignore lint/suspicious/noExplicitAny: must be any to support all module types
  configurator: IModulesConfigurator<any, any>,
  configure?: AuthConfigFn,
): void => {
  const config = configure ? configureMsal(configure) : { module };
  configurator.addConfig(config);
};

/**
 * Creates MSAL module configuration with custom setup.
 *
 * @param configure - Configuration callback function
 * @returns Module configuration object ready for framework integration
 *
 * @example
 * ```typescript
 * const msalConfig = configureMsal((builder) => {
 *   builder.setClientConfig(msalClientConfig);
 *   builder.setRequiresAuth(true);
 * });
 * ```
 */
export const configureMsal = (configure: AuthConfigFn) => ({
  module,
  configure,
});

declare module '@equinor/fusion-framework-module' {
  interface Modules {
    auth: MsalModule;
  }
}

export default module;
