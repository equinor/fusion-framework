import type { Module } from '@equinor/fusion-framework-module';
import type { HttpModule } from '@equinor/fusion-framework-module-http';
import type {
    ServiceDiscoveryModule,
    ServiceDiscoveryProvider,
} from '@equinor/fusion-framework-module-service-discovery';

import { IApiConfigurator, ApiConfigurator } from './configurator';
import { IApiProvider, ApiProvider } from './provider';

export type ServicesModuleKey = 'services';

export type ServicesModule = Module<
    ServicesModuleKey,
    IApiProvider,
    IApiConfigurator,
    [HttpModule, ServiceDiscoveryModule]
>;

/**
 *  Configure http-client
 */
export const module: ServicesModule = {
    name: 'services',
    configure: () => new ApiConfigurator(),
    initialize: async ({ ref, config, requireInstance, hasModule }) => {
        if (!config.createClient) {
            const http = await requireInstance('http');
            const serviceDiscovery: ServiceDiscoveryProvider | undefined = hasModule(
                'serviceDiscovery'
            )
                ? await requireInstance('serviceDiscovery')
                : ref?.serviceDiscovery;

            config.createClient = async (name: string) => {
                if (http.hasClient(name)) {
                    return http.createClient(name);
                }
                if (serviceDiscovery) {
                    return serviceDiscovery.createClient('name');
                }
                throw Error(`failed to create http client for service ${name}`);
            };
        }
        if (!config.createClient) {
            throw Error('missing configuration for creating API client');
        }
        return new ApiProvider(config as Required<IApiConfigurator>);
    },
};

declare module '@equinor/fusion-framework-module' {
    interface Modules {
        services: ServicesModule;
    }
}

export default module;
