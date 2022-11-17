import { AnyModule, ModuleInitializerArgs } from '@equinor/fusion-framework-module';
import { IHttpClient } from '@equinor/fusion-framework-module-http';
import { QueryCtorOptions } from '@equinor/fusion-observable/query';
import { moduleKey } from './module';
import type { AppConfig, AppManifest, ModuleDeps } from './types';

export interface IAppModuleConfig {
    getApp: QueryCtorOptions<AppManifest, { appKey: string }>;
    // TODO: add filter
    getApps: QueryCtorOptions<AppManifest[], void>;
    getConfig: QueryCtorOptions<AppConfig, { appKey: string; tag?: string }>;
}

export interface IAppConfigurator<TDeps extends Array<AnyModule>> {
    createConfig: (
        args: ModuleInitializerArgs<IAppConfigurator<TDeps>, TDeps>
    ) => Promise<IAppModuleConfig>;
    processConfig: (config: IAppModuleConfig) => IAppModuleConfig;
}

export class AppConfigurator<TDeps extends ModuleDeps = ModuleDeps>
    implements IAppConfigurator<TDeps>
{
    defaultExpireTime = 1 * 60 * 1000;

    /**
     * WARNING: this function will be remove in future
     */
    protected async _createHttpClient(
        init: ModuleInitializerArgs<IAppConfigurator<TDeps>, TDeps>
    ): Promise<IHttpClient> {
        const http = await init.requireInstance('http');
        /** check if the http provider has configure a client */
        if (http.hasClient(moduleKey)) {
            return http.createClient(moduleKey);
        } else {
            /** load service discovery module */
            const serviceDiscovery = await init.requireInstance('serviceDiscovery');
            /** resolve and create a client from discovery */
            return await serviceDiscovery.createClient('app');
        }
    }

    public async createConfig(
        args: ModuleInitializerArgs<IAppConfigurator<TDeps>, TDeps>
    ): Promise<IAppModuleConfig> {
        const httpClient = await this._createHttpClient(args);
        const config: IAppModuleConfig = {
            getApp: {
                client: {
                    fn: ({ appKey }) => httpClient.json$(`/api/apps/${appKey}`),
                },
                key: ({ appKey }) => appKey,
            },
            getApps: {
                client: {
                    fn: () => httpClient.json$(`/api/apps`),
                },
                key: () => 'apps',
            },
            getConfig: {
                client: {
                    fn: ({ appKey, tag }) =>
                        httpClient.json$(`/api/apps/${appKey}/config${tag ? `?tag=${tag}` : ''}`),
                },
                key: (args) => JSON.stringify(args),
            },
        };
        return this.processConfig(config);
    }

    public processConfig(config: IAppModuleConfig): IAppModuleConfig {
        return config;
    }
}
