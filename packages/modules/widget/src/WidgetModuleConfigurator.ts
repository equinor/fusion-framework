import { ModuleInitializerArgs } from '@equinor/fusion-framework-module';
import { HttpModule, IHttpClient } from '@equinor/fusion-framework-module-http';
import { ServiceDiscoveryModule } from '@equinor/fusion-framework-module-service-discovery';
import { QueryCtorOptions } from '@equinor/fusion-query';

import {
    WidgetModuleConfigBuilder,
    WidgetModuleConfigBuilderCallback,
    WidgetEndpointBuilder,
} from './WidgetModuleConfigBuilder';

import { moduleKey } from './module';

import type { GetWidgetParameters, WidgetManifest } from './types';

export interface WidgetModuleConfig {
    client: {
        // getWidgetManifest: QueryCtorOptions<WidgetManifest, { widgetKey: string }>;
        getWidget: QueryCtorOptions<WidgetManifest, GetWidgetParameters>;
    };
    endpointBuilder: WidgetEndpointBuilder;
}

export interface IWidgetModuleConfigurator {
    addConfigBuilder: (init: WidgetModuleConfigBuilderCallback) => void;
}

const defaultEndpointBuilder: WidgetEndpointBuilder = (params) => {
    const { widgetKey, args } = params;
    const { type, value } = args ?? {};
    switch (type) {
        case 'tag':
        case 'version':
            return `/widgets/${widgetKey}/versions/${value}`;
        default:
            return `/widgets/${widgetKey}`;
    }
};

const widgetSelector =
    (args: { apiVersion: string; uri: string }) =>
    async (response: Response): Promise<WidgetManifest> => {
        const data = await response.json();

        return {
            ...data,
            importBundle: async () =>
                import(
                    new URL(
                        `${data.assetPath}/${data.entryPoint}?api-version=${args.apiVersion}`,
                        args.uri,
                    ).toString()
                ),
        } as WidgetManifest;
    };

export class WidgetModuleConfigurator implements IWidgetModuleConfigurator {
    defaultExpireTime = 1 * 60 * 1000;

    #configBuilders: Array<WidgetModuleConfigBuilderCallback> = [];
    #apiVersion = '1.0';

    addConfigBuilder(init: WidgetModuleConfigBuilderCallback): void {
        this.#configBuilders.push(init);
    }

    constructor(apiVersion?: string) {
        if (apiVersion) {
            this.#apiVersion = apiVersion;
        }
    }

    /**
     * WARNING: this function will be remove in future
     */
    protected async _createHttpClient(
        init: ModuleInitializerArgs<
            IWidgetModuleConfigurator,
            [HttpModule, ServiceDiscoveryModule]
        >,
    ): Promise<IHttpClient> {
        const http = await init.requireInstance('http');
        /** check if the http provider has configure a client */
        if (http.hasClient(moduleKey)) {
            return http.createClient(moduleKey);
        } else {
            /** load service discovery module */
            const serviceDiscovery = await init.requireInstance('serviceDiscovery');

            const discoClient = await serviceDiscovery.createClient('apps');

            return discoClient;
        }
    }

    public async createConfig(
        init: ModuleInitializerArgs<
            IWidgetModuleConfigurator,
            [HttpModule, ServiceDiscoveryModule]
        >,
    ): Promise<WidgetModuleConfig> {
        const config = await this.#configBuilders.reduce(
            async (cur, cb) => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const builder = new WidgetModuleConfigBuilder(init, await cur);
                await Promise.resolve(cb(builder));
                return Object.assign(cur, builder.config);
            },
            Promise.resolve({} as Partial<WidgetModuleConfig>),
        );

        const { endpointBuilder = defaultEndpointBuilder } = config;

        // TODO - make less lazy
        config.client ??= await (async (): Promise<WidgetModuleConfig['client']> => {
            const httpClient = await this._createHttpClient(init);
            httpClient.requestHandler.setHeader('api-version', this.#apiVersion);
            return {
                getWidget: {
                    client: {
                        fn: (args) =>
                            httpClient.json$(endpointBuilder(args), {
                                selector: widgetSelector({
                                    apiVersion: this.#apiVersion,
                                    uri: httpClient.uri,
                                }),
                            }),
                    },
                    key: (args) => JSON.stringify(args),
                    expire: this.defaultExpireTime,
                },
            };
        })();

        return config as WidgetModuleConfig;
    }
}
