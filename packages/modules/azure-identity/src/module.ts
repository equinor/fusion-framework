import type { Module } from '@equinor/fusion-framework-module';
import { AzureIdentityAuthConfigurator, type AzureIdentityAuthConfig } from './configurator.js';
import { AuthProviderDefaultCredential } from './AuthProviderDefaultCredential.js';
import { ensureCachePersistencePlugin } from './ensure-cache-persistence-plugin.js';
import { AuthProviderInteractiveBrowser } from './AuthProviderInteractiveBrowser.js';
import { AuthProviderTokenOnly } from './AuthProviderTokenOnly.js';
import { connectAuthTelemetry } from './connect-auth-telemetry.js';
import type { IAuthProvider } from './AuthProvider.interface.js';

/** Telemetry disconnects owned by each initialized provider, released on module disposal. */
const telemetryConnections = new WeakMap<object, () => void>();

/**
 * Azure Identity authentication module for the Fusion Framework.
 *
 * Supports three modes:
 *
 * - **`default_credential`** — `DefaultAzureCredential` for CI/CD, managed identity,
 *   and Azure CLI environments.
 * - **`interactive`** — `InteractiveBrowserCredential` for CLI `login` / `logout`
 *   flows with browser-based authentication and OS-level token caching.
 * - **`token_only`** — static access token supplied externally.
 *
 * Registers under the module name `'auth'` so it is a drop-in replacement
 * for `@equinor/fusion-framework-module-msal-node`.
 */
export type AzureIdentityModule = Module<'auth', IAuthProvider, AzureIdentityAuthConfigurator>;

export const module: AzureIdentityModule = {
  name: 'auth',
  configure: () => new AzureIdentityAuthConfigurator(),
  initialize: async (args) => {
    const config: AzureIdentityAuthConfig = await args.config.createConfigAsync(args);

    // Build the appropriate provider implementation for the configured auth mode
    switch (config.mode) {
      case 'interactive':
        // Register the cache persistence plugin lazily — only interactive mode
        // needs OS-level token caching. Avoids loading the native `keytar`
        // binary in CI/headless environments.
        await ensureCachePersistencePlugin();
        return AuthProviderInteractiveBrowser.create({
          tenantId: config.tenantId,
          clientId: config.clientId,
          redirectPort: config.redirectPort,
          onOpen: config.onOpen,
        });

      case 'token_only':
        return new AuthProviderTokenOnly(config.accessToken);

      default:
        return new AuthProviderDefaultCredential();
    }
  },
  postInitialize: async ({ instance, modules }) => {
    // A static token involves no acquisition and must never be observed. The prototype check
    // is deliberate: provider `instanceof` is duck-typed and matches every module provider.
    if (!Object.prototype.isPrototypeOf.call(AuthProviderTokenOnly.prototype, instance)) {
      telemetryConnections.set(instance, connectAuthTelemetry(instance, modules.telemetry));
    }
  },
  dispose: ({ instance }) => {
    // Only telemetry is detached; provider disposal itself is unchanged.
    telemetryConnections.get(instance)?.();
    telemetryConnections.delete(instance);
  },
};

export default module;
