import { ServiceDiscoveryConfigurator } from './configurator';
import { IServiceDiscoveryProvider, ServiceDiscoveryProvider } from './provider';

import type {
  IModuleConfigurator,
  Module,
  ModulesConfigurator,
} from '@equinor/fusion-framework-module';
import type { HttpModule } from '@equinor/fusion-framework-module-http';

export const moduleName = 'serviceDiscovery';

export type ServiceDiscoveryModule = Module<
  typeof moduleName,
  IServiceDiscoveryProvider,
  ServiceDiscoveryConfigurator,
  [HttpModule]
>;

/**
 * Represents the Service Discovery module configuration.
 *
 * @remarks
 * This module is responsible for configuring and initializing the service discovery mechanism.
 * It ensures that the service discovery configuration is created and the necessary dependencies
 * are initialized before providing the service discovery provider.
 *
 * @returns {Promise<ServiceDiscoveryProvider>} - Returns a promise that resolves to the service discovery provider.
 *
 * @remarks
 * The initialization process involves creating the service discovery configuration, which may include
 * inheriting configurations from a parent module. This pattern, while allowing reuse of cache and ensuring
 * up-to-date configurations, can be risky as it exposes the child module to potential breaking changes
 * from the parent module's client.
 *
 * Additionally, the service discovery module requires the HTTP module to be initialized before it can
 * function properly.
 */
export const module: ServiceDiscoveryModule = {
  name: moduleName,
  configure: () => new ServiceDiscoveryConfigurator(),
  initialize: async (init) => {
    const { requireInstance, ref } = init;

    // create service discovery configuration
    const config = await init.config.createConfigAsync(init, {
      /**
       * @remarks
       * This is a dangerous pattern, as it allows the child module to access the parent module's client.
       * The client client could implement breaking changes that would affect the child module.
       * On the positive side, it allows the child module to reuse cache and always be up to date.
       */
      ...ref?.serviceDiscovery?.config,
    });

    // service discovery requires http module to be initialized
    const httpModule = await requireInstance('http');

    // return service discovery provider
    return new ServiceDiscoveryProvider(config, httpModule);
  },
};

/**
 * Configures the Service Discovery module.
 *
 * @template TRef - The type reference for the module configurator.
 * @param callback - A function that takes a `ServiceDiscoveryConfigurator` and returns a promise that resolves when the configuration is complete.
 * @returns An object implementing `IModuleConfigurator` for the `ServiceDiscoveryModule` with the provided configuration.
 *
 * @example
 * ```typescript
 * import { configureServiceDiscovery } from '@equinor/fusion-framework-module-service-discovery';
 *
 * const config = (configurator: ModuleConfigurator) => {
 *  configurator.addConfig(configureServiceDiscovery(async (config) => {
 *      // custom configuration
 * });
 * ```
 */
export const configureServiceDiscovery = <TRef>(
  callback: (config: ServiceDiscoveryConfigurator) => Promise<void>,
): IModuleConfigurator<ServiceDiscoveryModule, TRef> => ({
  module,
  configure: (config: ServiceDiscoveryConfigurator) => callback(config),
});

/**
 * Enables the service discovery module by adding its configuration to the provided configurator.
 *
 * @param configurator - The configurator to which the service discovery configuration will be added.
 * @param callback - An optional callback function that can be used to customize the service discovery configuration.
 *
 * @example
 * ```typescript
 * import { enableServiceDiscovery } from '@equinor/fusion-framework-module-service-discovery';
 *
 * const config = (configurator: ModuleConfigurator) => {
 *     // simple
 *     enableServiceDiscovery(configurator);
 *
 *     // with custom configuration
 *     enableServiceDiscovery(configurator, async (config) => {
 *         config.configureServiceDiscoveryClientByClientKey('service-discovery-custom');
 *     });
 * };
 * ```
 */
export const enableServiceDiscovery = (
  configurator: ModulesConfigurator<[HttpModule]>,
  callback?: (config: ServiceDiscoveryConfigurator) => Promise<void>,
): void => {
  configurator.addConfig(configureServiceDiscovery(callback ?? (() => Promise.resolve())));
};

declare module '@equinor/fusion-framework-module' {
  export interface Modules {
    serviceDiscovery: ServiceDiscoveryModule;
  }
}

export default module;
