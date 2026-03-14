import type {
  IModuleConfigurator,
  IModulesConfigurator,
  Module,
} from '@equinor/fusion-framework-module';
import type { HttpModule, IHttpClientProvider } from '@equinor/fusion-framework-module-http';
import type {
  ServiceDiscoveryModule,
  ServiceDiscoveryProvider,
} from '@equinor/fusion-framework-module-service-discovery';

import { type IApiConfigurator, ApiConfigurator } from './configurator';
import { type IApiProvider, ApiProvider } from './provider';

import type { ApiClientFactory } from './types';

/** String literal type for the services module registration key. */
export type ServicesModuleKey = 'services';

/** Module registration key used to identify the services module. */
export const moduleKey: ServicesModuleKey = 'services';

/**
 * Module definition for the services module.
 *
 * Declares the module key, provider type ({@link IApiProvider}),
 * configurator type ({@link IApiConfigurator}), and required
 * dependency modules (HTTP and service-discovery).
 */
export type ServicesModule = Module<
  ServicesModuleKey,
  IApiProvider,
  IApiConfigurator,
  [HttpModule, ServiceDiscoveryModule]
>;

/**
 * Creates the default {@link ApiClientFactory} by attempting named HTTP clients
 * first, then falling back to service-discovery.
 *
 * @param http - The HTTP client provider from the `http` module.
 * @param serviceDiscovery - Optional service-discovery provider for automatic client resolution.
 * @returns A factory function that creates named HTTP clients.
 */
const createDefaultClient =
  (http: IHttpClientProvider, serviceDiscovery?: ServiceDiscoveryProvider): ApiClientFactory =>
  async (name: string) => {
    if (http.hasClient(name)) {
      return http.createClient(name);
    }
    if (serviceDiscovery) {
      return serviceDiscovery.createClient(name);
    }
    throw Error(`failed to create http client for service ${name}`);
  };

/**
 * Services module definition.
 *
 * Registers the `'services'` module, wires up the {@link ApiConfigurator},
 * and initializes the {@link ApiProvider} with an HTTP client factory
 * resolved from the `http` and optional `serviceDiscovery` modules.
 */
export const module: ServicesModule = {
  name: moduleKey,
  configure: () => new ApiConfigurator(),
  initialize: async ({ ref, config, requireInstance, hasModule }) => {
    /** we can not create this callback within the configuration, since it might require other modules. */
    if (!config.createClient) {
      const http = await requireInstance('http');
      const serviceDiscovery: ServiceDiscoveryProvider | undefined = hasModule('serviceDiscovery')
        ? /** if the module is within module, await creation */
          await requireInstance('serviceDiscovery')
        : /** try to load parent service discovery provider */
          ref?.serviceDiscovery;

      config.createClient = createDefaultClient(http, serviceDiscovery);
    }
    if (!config.createClient) {
      throw Error('missing configuration for creating API client');
    }
    return new ApiProvider({ createClient: config.createClient });
  },
};

/**
 * Registers the services module with the framework configurator.
 *
 * Call this during app configuration to make the services module
 * available at runtime.
 *
 * @param config - The framework modules configurator.
 *
 * @example
 * ```ts
 * import { enableServices } from '@equinor/fusion-framework-module-services';
 * configurator.addConfig(enableServices);
 * ```
 */
export const enableServices = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  config: IModulesConfigurator<any, any>,
): void => {
  config.addConfig({ module });
};

/**
 * Creates a module configuration object for the services module
 * with a custom configuration callback.
 *
 * Use this when you need to customise the services module (for example,
 * supplying a custom `createClient` factory).
 *
 * @param configure - Callback that receives the {@link IApiConfigurator} for customisation.
 * @returns A module configurator object that can be passed to `addConfig`.
 *
 * @example
 * ```ts
 * import { configureServices } from '@equinor/fusion-framework-module-services';
 * configurator.addConfig(
 *   configureServices((cfg) => {
 *     cfg.createClient = myCustomClientFactory;
 *   }),
 * );
 * ```
 */
export const configureServices = (
  configure: (configurator: IApiConfigurator) => void,
): IModuleConfigurator<ServicesModule> => {
  return {
    module,
    configure,
  };
};

declare module '@equinor/fusion-framework-module' {
  interface Modules {
    services: ServicesModule;
  }
}

export default module;
