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
    deps: ['http'],
    configure: () => new ServiceDiscoveryConfigurator(),
    initialize: ({ serviceDiscovery: config }, modules) => {
        return new ServiceDiscoveryProvider(config, modules.http);
    },
    postConfigure: (config) => {
        const { clientKey } = config.serviceDiscovery;
        if (!config.http.hasClient(clientKey)) {
            console.warn(`missing http config for [${clientKey}]`);
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
