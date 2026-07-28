import { ServiceDiscoveryConfigurator } from './configurator';
import { type IServiceDiscoveryProvider, ServiceDiscoveryProvider } from './provider';

import type {
  IModuleConfigurator,
  Module,
  ModulesConfigurator,
} from '@equinor/fusion-framework-module';
import type { HttpModule } from '@equinor/fusion-framework-module-http';

/**
 * Module identifier used to register and look up the Service Discovery module
 * within the Fusion Framework module system.
 */
export const moduleName = 'serviceDiscovery';

/**
 * Type alias describing the Service Discovery module shape.
 *
 * @remarks
 * Binds together the module name, the runtime provider interface, the
 * configurator class, and the required dependency on {@link HttpModule}.
 */
export type ServiceDiscoveryModule = Module<
  typeof moduleName,
  IServiceDiscoveryProvider,
  ServiceDiscoveryConfigurator,
  [HttpModule]
>;

/**
 * Service Discovery module definition.
 *
 * Configures and initializes the service discovery mechanism within the
 * Fusion Framework module system. During initialization the module:
 *
 * 1. Creates the {@link ServiceDiscoveryConfig} (optionally inheriting the
 *    parent module's discovery client so sub-modules share cache).
 * 2. Resolves the required {@link HttpModule} instance.
 * 3. Returns a {@link ServiceDiscoveryProvider} ready to resolve endpoints.
 *
 * @remarks
 * When a parent module exposes its own `serviceDiscovery` config, the child
 * module reuses that configuration by default. This enables shared caching
 * and consistent service resolution but means breaking changes in the
 * parent's client can affect child modules.
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
 * Creates a module configurator object for the Service Discovery module.
 *
 * Use this when you need to add service discovery to a
 * {@link ModulesConfigurator} via `addConfig` and want full control over
 * the configuration callback.
 *
 * For the simpler "just enable it" path, prefer {@link enableServiceDiscovery}.
 *
 * @template TRef - Module reference type forwarded to the configurator.
 * @param callback - Receives a {@link ServiceDiscoveryConfigurator} and must
 *   return a `Promise` that resolves when configuration is complete.
 * @returns An `IModuleConfigurator` that can be passed to
 *   `ModulesConfigurator.addConfig`.
 *
 * @example
 * ```typescript
 * import { configureServiceDiscovery } from '@equinor/fusion-framework-module-service-discovery';
 *
 * const configure = (configurator: ModulesConfigurator) => {
 *   configurator.addConfig(
 *     configureServiceDiscovery(async (builder) => {
 *       builder.configureServiceDiscoveryClientByClientKey('my_sd_key');
 *     }),
 *   );
 * };
 * ```
 */
export const configureServiceDiscovery = <TRef>(
  callback: (config: ServiceDiscoveryConfigurator) => Promise<void>,
): IModuleConfigurator<ServiceDiscoveryModule, TRef> => ({
  module,
  configure: (config: ServiceDiscoveryConfigurator) => callback(config),
});

/**
 * Enables the Service Discovery module on a {@link ModulesConfigurator}.
 *
 * This is the recommended entry point for most consumers. When called
 * without a callback the module auto-detects an HTTP client registered
 * under the key `"service_discovery"`. Pass a callback to override the
 * client key, endpoint, or provide a fully custom discovery client.
 *
 * @param configurator - The modules configurator to register the module on.
 *   Must already include {@link HttpModule}.
 * @param callback - Optional async callback receiving a
 *   {@link ServiceDiscoveryConfigurator} for advanced setup.
 *
 * @example
 * ```typescript
 * import { enableServiceDiscovery } from '@equinor/fusion-framework-module-service-discovery';
 *
 * // Simplest usage — auto-detects the 'service_discovery' HTTP client
 * enableServiceDiscovery(configurator);
 *
 * // Custom HTTP client key
 * enableServiceDiscovery(configurator, async (builder) => {
 *   builder.configureServiceDiscoveryClientByClientKey('sd_custom');
 * });
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
