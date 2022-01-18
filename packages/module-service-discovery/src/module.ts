import { IServiceDiscoveryConfigurator, ServiceDiscoveryConfigurator } from './configurator';
import { IServiceDiscoveryProvider, ServiceDiscoveryProvider } from './provider';

import type { Module, ModulesConfigType } from '@equinor/fusion-framework-module';
import type { HttpModule } from '@equinor/fusion-framework-module-http';

export type ServiceDiscoveryModule = Module<
    'serviceDiscovery',
    IServiceDiscoveryProvider,
    IServiceDiscoveryConfigurator,
    [HttpModule]
>;

/**
 *  Configure http-client
 */
export const module: ServiceDiscoveryModule = {
    name: 'serviceDiscovery',
    configure: () => new ServiceDiscoveryConfigurator(),
    initialize: ({ serviceDiscovery: config }, instance) =>
        new ServiceDiscoveryProvider(config, instance.http),
    postConfigure: (config) => {
        const { clientKey, baseUrl } = config.serviceDiscovery;
        if (config.http.hasClient(clientKey) && baseUrl) {
            console.warn(
                `http is already configure for key [${clientKey}], overriding existing endpoint`
            );
            config.http.configureClient(clientKey, baseUrl);
        } else {
            config.http.configureClient(clientKey, baseUrl);
        }
    },
};

export const setupServiceDiscoveryModule = (
    config: ModulesConfigType<[ServiceDiscoveryModule]>,
    callback: (config: IServiceDiscoveryConfigurator) => void
): void | Promise<void> => {
    callback(config.serviceDiscovery);
};

declare module '@equinor/fusion-framework-module' {
    export interface Modules {
        serviceDiscovery: ServiceDiscoveryModule;
    }
}

export default module;
