import {
    BaseConfigBuilder,
    ConfigBuilderCallback,
    type ModuleInitializerArgs,
} from '@equinor/fusion-framework-module';
import type { HttpModule, IHttpClient } from '@equinor/fusion-framework-module-http';
import type { ServiceDiscoveryModule } from '@equinor/fusion-framework-module-service-discovery';
import type { QueryCtorOptions } from '@equinor/fusion-query';

import { moduleKey } from './module';

import type { AppConfig, ApiApp, ApiAppVersionConfig } from './types';
import { ApplicationManifest } from './ApplicationManifest';
import { map } from 'rxjs/operators';

export interface AppModuleConfig {
    client: {
        getAppManifest: QueryCtorOptions<ApplicationManifest, { appKey: string }>;
        getAppManifests: QueryCtorOptions<ApplicationManifest[], void>;
        getMyAppManifests: QueryCtorOptions<ApplicationManifest[], void>;
        getAppConfig: QueryCtorOptions<AppConfig, { appKey: string; tag?: string }>;
    };
    baseUri?: string;
}

export interface IAppConfigurator {
    setClient: (
        client_or_cb: AppModuleConfig['client'] | ConfigBuilderCallback<AppModuleConfig['client']>,
    ) => void;
    setBaseUri: (base_or_cb: string | ConfigBuilderCallback<string>) => void;
}

export class AppConfigurator
    extends BaseConfigBuilder<AppModuleConfig>
    implements IAppConfigurator
{
    defaultExpireTime = 1 * 60 * 1000;

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
            return await serviceDiscovery.createClient('apps', {
                onCreate(client) {
                    client.requestHandler.setHeader('Api-Version', '1.0-preview');
                },
            });
        }
    }

    public setClient(
        client_or_cb: AppModuleConfig['client'] | ConfigBuilderCallback<AppModuleConfig['client']>,
    ) {
        const cb = typeof client_or_cb === 'object' ? () => client_or_cb : client_or_cb;
        this._set('client', cb);
    }

    // TODO - explain why, used in import of resources aka proxy url
    public setBaseUri(base_or_cb: string | ConfigBuilderCallback<string>) {
        const cb = typeof base_or_cb === 'string' ? () => base_or_cb : base_or_cb;
        this._set('baseUri', cb);
    }

    protected _createConfig(
        init: ModuleInitializerArgs<IAppConfigurator, [HttpModule, ServiceDiscoveryModule]>,
        initial?: Partial<AppModuleConfig>,
    ) {
        if (!this._has('client')) {
            this.setClient(async () => {
                const httpClient = await this._createHttpClient(init);
                return {
                    getAppManifest: {
                        client: {
                            fn: ({ appKey }) =>
                                httpClient
                                    .json$<ApiApp>(`/apps/${appKey}`)
                                    .pipe(map((apiApp) => new ApplicationManifest(apiApp))),
                        },
                        key: ({ appKey }) => appKey,
                        expire: this.defaultExpireTime,
                    },
                    getAppManifests: {
                        client: {
                            // TODO: add to config if use me or not
                            fn: () =>
                                httpClient.json$<{ value: ApiApp[] }>(`/apps`).pipe(
                                    map((x) => {
                                        const apps = x.value.map(
                                            (apiApp) => new ApplicationManifest(apiApp),
                                        );
                                        return apps;
                                    }),
                                ),
                        },
                        // TODO - might cast to checksum
                        key: () => 'manifests',
                        expire: this.defaultExpireTime,
                    },
                    getMyAppManifests: {
                        client: {
                            // TODO: add to config if use me or not
                            fn: () =>
                                httpClient.json$<{ value: ApiApp[] }>(`/persons/me/apps`).pipe(
                                    map((x) => {
                                        const apps = x.value.map(
                                            (apiApp) => new ApplicationManifest(apiApp),
                                        );
                                        return apps;
                                    }),
                                ),
                        },
                        // TODO - might cast to checksum
                        key: () => 'manifests',
                        expire: this.defaultExpireTime,
                    },
                    getAppConfig: {
                        client: {
                            fn: ({ appKey, tag = 'latest' }) =>
                                httpClient.json$<ApiAppVersionConfig>(
                                    `/apps/${appKey}/builds/${tag}/config`,
                                ),
                        },
                        key: (args) => JSON.stringify(args),
                        expire: this.defaultExpireTime,
                    },
                };
            });
        }

        if (!this._has('baseUri')) {
            this.setBaseUri('/apps-proxy');
        }

        return super._createConfig(init, initial);
    }
}
