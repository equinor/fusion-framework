import { ModulesConfigurator } from '@equinor/fusion-framework-module';
import { enableAzureIdentityAuth } from '@equinor/fusion-framework-module-azure-identity';
import { module as httpModule } from '@equinor/fusion-framework-module-http';
import { enableServiceDiscovery } from '@equinor/fusion-framework-module-service-discovery';
import isContinuousIntegration from 'is-ci';

import { FusionEnv, type Modules } from './framework.node.js';

// Default scope for Fusion service discovery
const FUSION_SERVICE_SCOPE = ['5a842df8-3238-415d-b168-9f16a6a6031b/.default'];

/**
 * Auth option for direct token usage.
 */
interface AuthTokenOptions {
  token: string;
}

/**
 * Auth option for silent authentication (non-interactive).
 */
interface AuthSilentOptions {
  clientId: string;
  tenantId: string;
  interactive?: false;
}

/**
 * Auth option for interactive authentication, including server config.
 */
interface AuthInteractiveOptions extends Omit<AuthSilentOptions, 'interactive'> {
  interactive: true;
  server: {
    port: number;
    onOpen?: (url: string) => void;
  };
}

/**
 * Auth option for Azure Identity's DefaultAzureCredential.
 * No configuration needed — credentials are resolved from the environment.
 */
interface AuthDefaultCredentialOptions {
  defaultCredential: true;
}

/**
 * Settings for initializing the Fusion Framework.
 * Includes environment, authentication, and service discovery options.
 */
export type FusionFrameworkSettings = {
  env?: (typeof FusionEnv)[keyof typeof FusionEnv];
  auth:
    | AuthTokenOptions
    | AuthSilentOptions
    | AuthInteractiveOptions
    | AuthDefaultCredentialOptions;
  serviceDiscovery?: {
    url?: string;
    scope?: string[];
  };
};

/**
 * Configures the Fusion Framework with the provided settings and returns a configurator.
 *
 * This function creates and configures a module configurator with HTTP, service discovery,
 * and authentication modules based on the supplied configuration. The returned configurator
 * can be further customized before initialization.
 *
 * @param config - The settings for framework configuration.
 * @returns A configured module configurator ready for initialization.
 * @throws Will throw if required authentication parameters are missing.
 */
export const configureFramework = (
  config: FusionFrameworkSettings,
): ModulesConfigurator<Modules> => {
  // Create a new module configurator for the framework
  const configurator = new ModulesConfigurator<Modules>();
  // Determine the environment to use, defaulting to CI if not specified
  const env = config.env ?? FusionEnv.ContinuesIntegration;

  // Configure the HTTP module for service discovery
  configurator.addConfig({
    module: httpModule,
    configure: (builder) => {
      // Use CI environment for service discovery in development, otherwise use the selected env
      const serviceDiscoveryEnv =
        env === FusionEnv.Development ? FusionEnv.ContinuesIntegration : env;
      // Determine the base URI for service discovery
      const baseUri =
        config.serviceDiscovery?.url ??
        new URL(
          `/service-registry/environments/${serviceDiscoveryEnv}/services`,
          'https://discovery.fusion.equinor.com',
        ).toString();
      // Use provided scopes or default Fusion service scope
      const defaultScopes = config.serviceDiscovery?.scope ?? FUSION_SERVICE_SCOPE;
      // Register the service discovery client with the HTTP module
      builder.configureClient('service_discovery', {
        baseUri,
        defaultScopes,
      });
    },
  });

  // Enable the service discovery module
  enableServiceDiscovery(configurator);

  // Enable the authentication module — Azure Identity for all modes
  const { auth } = config;

  enableAzureIdentityAuth(configurator, (builder) => {
    // Prefer DefaultAzureCredential when explicitly configured (CI/CD, managed identity, OIDC)
    if ('defaultCredential' in auth && auth.defaultCredential) {
      // Use DefaultAzureCredential (CI/CD, managed identity, OIDC)
      builder.setDefaultCredential();
      return;
    }

    // Fall back to a pre-obtained static token when provided
    if ('token' in auth && auth.token) {
      // Use a pre-obtained static token
      builder.setTokenOnly(auth.token);
      return;
    }

    // Interactive or silent — both use InteractiveBrowserCredential.
    // The credential silently uses cached tokens and only opens a browser
    // when no cached credentials are available.
    const { clientId, tenantId } = auth as AuthSilentOptions;
    // Both silent and interactive modes require these to build a credential
    if (!clientId || !tenantId) {
      throw new Error('clientId and tenantId are required for auth module');
    }

    // Interactive mode with custom server configuration
    if ('interactive' in auth && auth.interactive) {
      const { server } = auth as AuthInteractiveOptions;
      // A redirect port is required to receive the interactive auth callback
      if (!server.port) {
        throw new Error('server.port is required for interactive mode');
      }
      builder.setInteractive({
        tenantId,
        clientId,
        redirectPort: server.port,
        onOpen: server.onOpen,
      });

      return;
    }

    // In CI environments with no token provided, use DefaultAzureCredential.
    // This avoids loading keytar/libsecret (native modules unavailable on
    // GitHub-hosted runners and other headless CI environments) and instead
    // uses the ambient credential chain: OIDC, managed identity, Azure CLI, etc.
    // established by azure/login or equivalent CI tooling.
    if (isContinuousIntegration) {
      builder.setDefaultCredential();
      return;
    }

    // Local non-interactive callers — use a default port.
    // InteractiveBrowserCredential will use cached tokens silently.
    builder.setInteractive({
      tenantId,
      clientId,
      redirectPort: 49741,
    });
  });

  return configurator;
};
