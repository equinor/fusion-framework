import { ModulesConfigurator, type ModulesInstance } from '@equinor/fusion-framework-module';
import { enableAuthModule, type MsalNodeModule } from '@equinor/fusion-framework-module-msal-node';
import { type HttpModule, module as httpModule } from '@equinor/fusion-framework-module-http';
import {
  type ServiceDiscoveryModule,
  enableServiceDiscovery,
} from '@equinor/fusion-framework-module-service-discovery';
import isContinuousIntegration from 'is-ci';

// Define the module types used in the framework instance
// This tuple ensures type safety for the framework's module composition
// Add or remove modules here to change the framework's capabilities
type Modules = [MsalNodeModule, HttpModule, ServiceDiscoveryModule];

/**
 * Type representing the initialized Fusion Framework instance.
 * This is a composition of the modules defined in the Modules tuple.
 */
export type FusionFramework = ModulesInstance<Modules>;

// Default scope for Fusion service discovery
const FUSION_SERVICE_SCOPE = ['5a842df8-3238-415d-b168-9f16a6a6031b/.default'];

/**
 * Enum for supported Fusion environments.
 * Used to select the correct environment for service discovery and authentication.
 */
export enum FusionEnv {
  ContinuesIntegration = 'ci',
  QualityAssurance = 'fqa',
  Training = 'tr',
  Production = 'fprd',
  Development = 'dev',
}

/**
 * Resolves the default environment based on CI status and dev allowance.
 *
 * @param allowDev - If true, allows development environment when not in CI.
 * @returns The resolved Fusion environment.
 */
export const resolveDefaultEnv = (allowDev: boolean) => {
  // If development is allowed and not running in CI, use development environment
  if (allowDev && !isContinuousIntegration) {
    return FusionEnv.Development;
  }
  // Otherwise, default to CI environment
  return FusionEnv.ContinuesIntegration;
};

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
 * Settings for initializing the Fusion Framework.
 * Includes environment, authentication, and service discovery options.
 */
export type FusionFrameworkSettings = {
  env?: (typeof FusionEnv)[keyof typeof FusionEnv];
  auth: AuthTokenOptions | AuthSilentOptions | AuthInteractiveOptions;
  serviceDiscovery?: {
    url?: string;
    scope?: string[];
  };
};

/**
 * Initializes the Fusion Framework with the provided settings.
 *
 * This function configures HTTP, service discovery, and authentication modules
 * based on the supplied configuration. It supports multiple authentication modes
 * and allows customization of service discovery endpoints and scopes.
 *
 * @param config - The settings for framework initialization.
 * @returns A promise resolving to the initialized Fusion Framework instance.
 * @throws Will throw if required authentication parameters are missing.
 */
export const initializeFramework = async (
  config: FusionFrameworkSettings,
): Promise<FusionFramework> => {
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

  // Enable the authentication module with custom configuration logic
  enableAuthModule(configurator, (builder) => {
    const { auth } = config;
    // Handle direct token authentication
    if ('token' in auth && auth.token) {
      const { token } = auth as AuthTokenOptions;
      builder.setMode('token_only');
      builder.setAccessToken(token);
      return;
    }

    // Handle silent or interactive authentication
    const { clientId, tenantId, interactive } = auth as AuthSilentOptions;
    if (!clientId || !tenantId) {
      // Both clientId and tenantId are required for these modes
      throw new Error('clientId and tenantId are required for auth module');
    }

    // Set client configuration for authentication
    builder.setClientConfig(tenantId, clientId);

    // Set authentication mode based on interactive flag
    builder.setMode(interactive ? 'interactive' : 'silent');
    if (interactive) {
      // For interactive mode, server configuration is required
      const { server } = auth as AuthInteractiveOptions;
      if (!server.port) {
        throw new Error('server.port is required for interactive mode');
      }
      builder.setServerPort(server.port);
      builder.setServerOnOpen(server.onOpen);
    }
  });

  // Initialize all configured modules and return the framework instance
  const instance = await configurator.initialize();

  return instance;
};
