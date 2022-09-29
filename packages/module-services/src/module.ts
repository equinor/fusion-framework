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

import { IApiConfigurator, ApiConfigurator } from './configurator';
import { IApiProvider, ApiProvider } from './provider';

import type { ApiClientFactory } from './types';

export type ServicesModuleKey = 'services';

export const moduleKey: ServicesModuleKey = 'services';

export type ServicesModule = Module<
    ServicesModuleKey,
    IApiProvider,
    IApiConfigurator,
    [HttpModule, ServiceDiscoveryModule]
>;

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
 *  Configure http-client
 */
export const module: ServicesModule = {
    name: moduleKey,
    configure: () => new ApiConfigurator(),
    initialize: async ({ ref, config, requireInstance, hasModule }) => {
        /** we can not create this callback within the configuration, since it might require other modules. */
        if (!config.createClient) {
            const http = await requireInstance('http');
            const serviceDiscovery: ServiceDiscoveryProvider | undefined = hasModule(
                'serviceDiscovery'
            )
                ? /** if the module is within module, await creation */
                  await requireInstance('serviceDiscovery')
                : /** try to load parent service discovery provider */
                  ref?.serviceDiscovery;

            config.createClient = createDefaultClient(http, serviceDiscovery);
        }
        if (!config.createClient) {
            throw Error('missing configuration for creating API client');
        }
        return new ApiProvider(config as Required<IApiConfigurator>);
    },
};

export const enableServices = (config: IModulesConfigurator): void => {
    config.addConfig({ module });
};

export const configureServices = (
    configure: (configurator: IApiConfigurator) => void
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
