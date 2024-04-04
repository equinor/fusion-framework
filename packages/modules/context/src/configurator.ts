import { ObservableInput } from 'rxjs';

import {
    AnyModuleInstance,
    ModuleInitializerArgs,
    ModuleInstance,
    ModulesInstanceType,
} from '@equinor/fusion-framework-module';
import { ServicesModule, IApiProvider } from '@equinor/fusion-framework-module-services';
import { NavigationModule } from '@equinor/fusion-framework-module-navigation';
import { getContextSelector, queryContextSelector, relatedContextSelector } from './selectors';
import { QueryCtorOptions } from '@equinor/fusion-query';
import {
    ContextFilterFn,
    ContextItem,
    QueryContextParameters,
    RelatedContextParameters,
} from './types';
import { GetContextParameters } from './client/ContextClient';
import { ContextConfigBuilder, ContextConfigBuilderCallback } from './ContextConfigBuilder';
import { type IContextProvider } from './ContextProvider';
import resolveInitialContext from './utils/resolve-initial-context';

/**
 * Configuration options for the ContextModule.
 */
export interface ContextModuleConfig {
    /**
     * Configuration for client queries.
     */
    client: {
        /**
         * Configuration for the "get" query for fetching a single context item.
         */
        get: QueryCtorOptions<ContextItem, GetContextParameters>;

        /**
         * Configuration for the "query" query for fetching multiple context items.
         */
        query: QueryCtorOptions<ContextItem[], QueryContextParameters>;

        /**
         * Optional configuration for the "related" query for fetching related context items.
         */
        related?: QueryCtorOptions<ContextItem[], RelatedContextParameters>;
    };

    /**
     * Optional array of context types to filter the contexts.
     */
    contextType?: string[];

    /**
     * Optional filter function to apply additional filtering to contexts.
     */
    contextFilter?: ContextFilterFn;

    /**
     * Whether to connect the context module to the parent context module.
     * Default value is `true`.
     */
    connectParentContext?: boolean;

    /**
     * Whether to skip setting the initial context from the parent.
     * If `true`, will not await to resolve the initial context.
     */
    skipInitialContext?: boolean;

    /**
     * Optional method for generating context query parameters based on the provided arguments.
     */
    contextParameterFn?: (args: {
        search: string;
        type: ContextModuleConfig['contextType'];
    }) => string | QueryContextParameters;

    /**
     * Optional method to resolve the current context item.
     */
    resolveContext?: (
        this: IContextProvider,
        item: ContextItem | null,
    ) => ReturnType<IContextProvider['resolveContext']>;

    /**
     * Optional method to validate the current context item.
     */
    validateContext?: (
        this: IContextProvider,
        item: ContextItem | null,
    ) => ReturnType<IContextProvider['validateContext']>;

    /**
     * Optional method to resolve the initial context based on the provided arguments.
     */
    resolveInitialContext?: (args: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ref?: AnyModuleInstance | any;
        modules: ModuleInstance;
    }) => ObservableInput<ContextItem | void>;
}

/**
 * Interface for the ContextModule configurator.
 */
export interface IContextModuleConfigurator {
    /**
     * Adds a configuration builder callback to the configurator.
     */
    addConfigBuilder: (init: ContextConfigBuilderCallback) => void;
}

/**
 * Class responsible for configuring the ContextModule.
 */
export class ContextModuleConfigurator implements IContextModuleConfigurator {
    /**
     * Default expiration time for queries.
     */
    defaultExpireTime = 1 * 60 * 1000;

    /**
     * Private array of configuration builder callbacks.
     */
    #configBuilders: Array<ContextConfigBuilderCallback> = [];

    /**
     * Adds a configuration builder callback to the configurator.
     * @param init The configuration builder callback to add.
     */
    addConfigBuilder(init: ContextConfigBuilderCallback): void {
        this.#configBuilders.push(init);
    }

    /**
     * Protected method to get the service provider from the module initializer arguments.
     * @param init The module initializer arguments.
     * @returns A promise that resolves to the IApiProvider instance.
     */
    protected async _getServiceProvider(
        init: ModuleInitializerArgs<IContextModuleConfigurator, [ServicesModule]>,
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

    /**
     * Public method to create the configuration for the ContextModule.
     * @param init The module initializer arguments.
     * @returns A promise that resolves to the ContextModuleConfig instance.
     */
    public async createConfig(
        init: ModuleInitializerArgs<IContextModuleConfigurator, [ServicesModule, NavigationModule]>,
    ): Promise<ContextModuleConfig> {
        const config = await this.#configBuilders.reduce(
            async (cur, cb) => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const builder = new ContextConfigBuilder<any, any>(init, await cur);
                await Promise.resolve(cb(builder));
                return Object.assign(cur, builder.config);
            },
            Promise.resolve({} as Partial<ContextModuleConfig>),
        );

        config.resolveInitialContext ??= resolveInitialContext();

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
                                { selector: queryContextSelector },
                            ),
                    },
                    // TODO - might cast to checksum
                    key: (args) => JSON.stringify(args),
                    expire: this.defaultExpireTime,
                },
                related: {
                    client: {
                        fn: (args) => {
                            return contextClient.related(
                                'v1',
                                { id: args.item.id, query: { filter: args.filter } },
                                { selector: relatedContextSelector },
                            );
                        },
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
