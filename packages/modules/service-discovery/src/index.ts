/**
 * Fusion Framework Service Discovery module.
 *
 * Resolves service endpoint URIs and authentication scopes from a central
 * service discovery API so that application code can request named services
 * without hard-coding URLs.
 *
 * @remarks
 * The module depends on {@link @equinor/fusion-framework-module-http | HttpModule}
 * for HTTP transport. The HTTP module must be enabled and configured before
 * service discovery is used.
 *
 * @see {@link enableServiceDiscovery} for the simplest way to add the module.
 * @see {@link ServiceDiscoveryConfigurator} for advanced configuration.
 * @see {@link IServiceDiscoveryProvider} for the runtime API surface.
 *
 * [[include:module-service-discovery/README.MD]]
 * @module
 */

export * from './types';
export { ServiceDiscoveryConfigurator } from './configurator';
export type { ServiceDiscoveryConfig } from './configurator';
export { IServiceDiscoveryProvider, ServiceDiscoveryProvider } from './provider';
export {
  default,
  ServiceDiscoveryModule,
  configureServiceDiscovery,
  enableServiceDiscovery,
} from './module';
export type { IServiceDiscoveryClient } from './client';
