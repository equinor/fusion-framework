import { Module, ModulesInstanceType } from '@equinor/fusion-framework-module';
import { HttpModule, IHttpClient } from '@equinor/fusion-framework-module-http';
import { ServiceDiscoveryModule } from '@equinor/fusion-framework-module-service-discovery';

import { IAppConfigConfigurator, AppConfigConfigurator } from './configurator';
import { IAppConfigProvider, AppConfigProvider } from './provider';

export const moduleKey = 'appConfig';

export type AppConfigModule = Module<
    typeof moduleKey,
    IAppConfigProvider,
    IAppConfigConfigurator,
    [HttpModule, ServiceDiscoveryModule]
>;

/**
 * @protected
 *
 * Internal function for resolving http client from modules.
 *
 * Normally called from submodules(App)
 */
const createHttpClient = async (
    modules: Partial<ModulesInstanceType<[HttpModule, ServiceDiscoveryModule]>>
): Promise<IHttpClient | undefined> => {
    /** early exit if there are no http module */
    if (!modules.http) {
        throw Error('Missing [http] module!');
    }

    /** check if there is defined a http client for module */
    if (modules.http.hasClient(moduleKey)) {
        return modules.http.createClient(moduleKey);
    } else if (!modules.serviceDiscovery) {
        throw Error(`No http client configured for [${moduleKey}]`);
    }

    /** try to resolve client from  */
    const service = await modules.serviceDiscovery.resolveService('portal');
    return modules.http.createClient({
        baseUri: service.uri,
        defaultScopes: service.defaultScopes,
    });
};

export const module: AppConfigModule = {
    name: moduleKey,
    configure: async (ref?: Partial<ModulesInstanceType<[HttpModule, ServiceDiscoveryModule]>>) => {
        const configurator = new AppConfigConfigurator();
        if (ref) {
            try {
                /** set client from parent module context */
                configurator.httpClient = await createHttpClient(ref);
            } catch (err) {
                console.warn(err);
            }
        }
        return configurator;
    },
    initialize: async ({ config, requireInstance }): Promise<IAppConfigProvider> => {
        console.warn('module deprecated!, use module-app')
        /** if no client provided from config tyy to create one */
        if (!config.httpClient) {
            /** load http module */
            const http = await requireInstance('http');

            /** check if the http provider has configure a client */
            if (http.hasClient(moduleKey)) {
                config.httpClient = http.createClient(moduleKey);
            } else {
                /** load service discovery module */
                const serviceDiscovery = await requireInstance('serviceDiscovery');
                /** resolve and create a client from discovery */
                config.httpClient = await serviceDiscovery.createClient('portal');
            }
        }
        if (!config.httpClient) {
            throw Error('no http client provided for app configuration!');
        }
        return new AppConfigProvider(config);
    },
};

export default module;

declare module '@equinor/fusion-framework-module' {
    interface Modules {
        appConfig: AppConfigModule;
    }
}
