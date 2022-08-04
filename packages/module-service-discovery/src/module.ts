import { IServiceDiscoveryConfigurator, ServiceDiscoveryConfigurator } from './configurator';
import { IServiceDiscoveryProvider, ServiceDiscoveryProvider } from './provider';

import type { Module, ModulesConfigType } from '@equinor/fusion-framework-module';
import type { HttpModule } from '@equinor/fusion-framework-module-http';
import { ServiceDiscoveryClient } from './client';
import { moduleName } from './constants';

export type ServiceDiscoveryModule = Module<
    typeof moduleName,
    IServiceDiscoveryProvider,
    IServiceDiscoveryConfigurator,
    [HttpModule]
>;

/**
 *  Configure http-client
 */
export const module: ServiceDiscoveryModule = {
    name: moduleName,
    // deps: ['http'],
    configure: () =>
        new ServiceDiscoveryConfigurator({
            clientCtor: ServiceDiscoveryClient,
            clientKey: 'service_discovery',
            endpoint: '/_discovery/environments/current',
        }),
    initialize: async (config) => {
        const httpModule = await config.requireInstance('http');
        const httpClient = await config.serviceDiscovery.createHttpClientClient(httpModule);
        const discoClient = await config.serviceDiscovery.createClient(httpClient);
        return new ServiceDiscoveryProvider(discoClient, httpModule);
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
