/**
 * [[include:module-service-discovery/README.MD]]
 * @module
 */

export * from './types';
export { IServiceDiscoveryConfigurator, ServiceDiscoveryConfigurator } from './configurator';
export { IServiceDiscoveryProvider, ServiceDiscoveryProvider } from './provider';
export { default, ServiceDiscoveryModule, setupServiceDiscoveryModule } from './module';
