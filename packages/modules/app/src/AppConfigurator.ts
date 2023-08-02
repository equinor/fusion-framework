import { ModuleInitializerArgs } from '@equinor/fusion-framework-module';
import { HttpModule, IHttpClient } from '@equinor/fusion-framework-module-http';
import { ServiceDiscoveryModule } from '@equinor/fusion-framework-module-service-discovery';
import { QueryCtorOptions } from '@equinor/fusion-query';

import { AppConfigBuilder, AppConfigBuilderCallback } from './AppConfigBuilder';

import { moduleKey } from './module';

import type { AppConfig, AppManifest } from './types';

export interface AppModuleConfig {
    client: {
        getAppManifest: QueryCtorOptions<AppManifest, { appKey: string }>;
        getAppManifests: QueryCtorOptions<AppManifest[], void>;
        getAppConfig: QueryCtorOptions<AppConfig, { appKey: string; tag?: string }>;
    };
}

export interface IAppConfigurator {
    addConfigBuilder: (init: AppConfigBuilderCallback) => void;
}

export class AppConfigurator implements IAppConfigurator {
    defaultExpireTime = 1 * 60 * 1000;

    #configBuilders: Array<AppConfigBuilderCallback> = [];

    addConfigBuilder(init: AppConfigBuilderCallback): void {
        this.#configBuilders.push(init);
    }

    /**
     * WARNING: this function will be remove in future
     */
    protected async _createHttpClient(
        init: ModuleInitializerArgs<IAppConfigurator, [HttpModule, ServiceDiscoveryModule]>,
    ): Promise<IHttpClient> {
        const http = await init.requireInstance('http');
        /** check if the http provider has configure a client */
        if (http.hasClient(moduleKey)) {
            return http.createClient(moduleKey);
        } else {
            /** load service discovery module */
            const serviceDiscovery = await init.requireInstance('serviceDiscovery');

            // TODO - remove when refactor portal service!
            /** resolve and create a client from discovery */
            try {
                return await serviceDiscovery.createClient('app');
            } catch {
                return await serviceDiscovery.createClient('portal');
            }
        }
    }

    public async createConfig(
        init: ModuleInitializerArgs<IAppConfigurator, [HttpModule, ServiceDiscoveryModule]>,
    ): Promise<AppModuleConfig> {
        const config = await this.#configBuilders.reduce(
            async (cur, cb) => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const builder = new AppConfigBuilder(init, await cur);
                await Promise.resolve(cb(builder));
                return Object.assign(cur, builder.config);
            },
            Promise.resolve({} as Partial<AppModuleConfig>),
        );

        // TODO - make less lazy
        config.client ??= await (async (): Promise<AppModuleConfig['client']> => {
            const httpClient = await this._createHttpClient(init);
            return {
                getAppManifest: {
                    client: {
                        fn: ({ appKey }) => httpClient.json$<AppManifest>(`/api/apps/${appKey}`),
                    },
                    key: ({ appKey }) => appKey,
                    expire: this.defaultExpireTime,
                },
                getAppManifests: {
                    client: {
                        fn: () => httpClient.json$(`/api/apps`),
                    },
                    // TODO - might cast to checksum
                    key: () => 'manifests',
                    expire: this.defaultExpireTime,
                },
                getAppConfig: {
                    client: {
                        fn: ({ appKey, tag }) =>
                            httpClient.json$(
                                `/api/apps/${appKey}/config${tag ? `?tag=${tag}` : ''}`,
                            ),
                    },
                    key: (args) => JSON.stringify(args),
                    expire: this.defaultExpireTime,
                },
            };
        })();

        return config as AppModuleConfig;
    }
}
