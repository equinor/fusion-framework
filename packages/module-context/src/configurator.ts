import { ModuleInitializerArgs, ModulesInstanceType } from '@equinor/fusion-framework-module';
import { ServicesModule, IApiProvider } from '@equinor/fusion-framework-module-services';
import { getContextSelector, queryContextSelector } from './selectors';
import { QueryCtorOptions } from '@equinor/fusion-query';
import { ContextFilterFn, ContextItem, QueryContextParameters } from './types';
import { GetContextParameters } from './client/ContextClient';
import { ContextConfigBuilder, ContextConfigBuilderCallback } from './ContextConfigBuilder';

export interface ContextModuleConfig {
    client: {
        get: QueryCtorOptions<ContextItem, GetContextParameters>;
        query: QueryCtorOptions<ContextItem[], QueryContextParameters>;
    };
    contextType?: string[];
    contextFilter?: ContextFilterFn;
}

export interface IContextModuleConfigurator {
    addConfigBuilder: (init: ContextConfigBuilderCallback) => void;
}

export class ContextModuleConfigurator implements IContextModuleConfigurator {
    defaultExpireTime = 1 * 60 * 1000;

    #configBuilders: Array<ContextConfigBuilderCallback> = [];

    addConfigBuilder(init: ContextConfigBuilderCallback): void {
        this.#configBuilders.push(init);
    }

    protected async _getServiceProvider(
        init: ModuleInitializerArgs<IContextModuleConfigurator, [ServicesModule]>
    ): Promise<IApiProvider> {
        if (init.hasModule('services')) {
            return init.requireInstance('services');
        } else {
            const parentServiceModule = (init.ref as ModulesInstanceType<[ServicesModule]>)
                ?.services;
            if (parentServiceModule) {
                return parentServiceModule;
            }
            throw Error('no service services provider configures [ServicesModule]');
        }
    }

    public async createConfig(
        init: ModuleInitializerArgs<IContextModuleConfigurator, [ServicesModule]>
    ): Promise<ContextModuleConfig> {
        const config = await this.#configBuilders.reduce(async (cur, cb) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const builder = new ContextConfigBuilder<any, any>(init, await cur);
            await Promise.resolve(cb(builder));
            return Object.assign(cur, builder.config);
        }, Promise.resolve({} as Partial<ContextModuleConfig>));

        // TODO - make less lazy
        config.client ??= await (async (): Promise<ContextModuleConfig['client']> => {
            const apiProvider = await this._getServiceProvider(init);
            const contextClient = await apiProvider.createContextClient('json$');
            return {
                get: {
                    client: {
                        fn: (args) =>
                            contextClient.get('v1', args, { selector: getContextSelector }),
                    },
                    key: ({ id }) => id,
                    expire: this.defaultExpireTime,
                },
                query: {
                    client: {
                        fn: (query) =>
                            contextClient.query(
                                'v1',
                                { query },
                                { selector: queryContextSelector }
                            ),
                    },
                    // TODO - might cast to checksum
                    key: (args) => JSON.stringify(args),
                    expire: this.defaultExpireTime,
                },
            };
        })();

        return config as ContextModuleConfig;
    }
}

export default ContextModuleConfigurator;
