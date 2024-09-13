/**
 * [[include:module-service-discovery/README.MD]]
 * @module
 */

export * from './types';
export { ServiceDiscoveryConfigurator } from './configurator';
export { IServiceDiscoveryProvider, ServiceDiscoveryProvider } from './provider';
export {
    default,
    ServiceDiscoveryModule,
    configureServiceDiscovery,
    enableServiceDiscovery,
} from './module';
