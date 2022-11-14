import { AnyModule, ModuleInitializerArgs } from '@equinor/fusion-framework-module';
import { ServicesModule } from '@equinor/fusion-framework-module-services';
import { QueryCtorOptions } from '@equinor/fusion-observable/query';
import { ContextClientOptions } from './client/ContextClient';
import { ContextItem, QueryContextParameters } from './types';
import { getContextSelector, queryContextSelector } from './selectors';

export interface IContextModuleConfig {
    getContext: ContextClientOptions;
    queryContext: QueryCtorOptions<ContextItem[], QueryContextParameters>;
}

export interface IContextModuleConfigurator<TDeps extends Array<AnyModule> = [ServicesModule]> {
    /** fired on initialize of module */
    createConfig: (
        args: ModuleInitializerArgs<IContextModuleConfigurator, TDeps>
    ) => Promise<IContextModuleConfig>;
    processConfig: (config: IContextModuleConfig) => IContextModuleConfig;

    /** fired on initialize of module */
    createContextClientGet(
        init: ModuleInitializerArgs<IContextModuleConfigurator, [ServicesModule]>
    ): Promise<QueryCtorOptions<ContextItem, { id: string }>['client']>;

    /** fired on initialize of module */
    createContextClientQuery(
        init: ModuleInitializerArgs<IContextModuleConfigurator, [ServicesModule]>
    ): Promise<QueryCtorOptions<ContextItem[], QueryContextParameters>['client']>;
}

export class ContextModuleConfigurator implements IContextModuleConfigurator<[ServicesModule]> {
    getContext?: Promise<ContextClientOptions['query']['client']>;

    defaultExpireTime = 1 * 60 * 1000;

    public async createContextClientGet(
        init: ModuleInitializerArgs<IContextModuleConfigurator, [ServicesModule]>
    ): Promise<QueryCtorOptions<ContextItem, { id: string }>['client']> {
        const provider = await init.requireInstance('services');
        const contextClient = await provider.createContextClient('json$');
        return {
            fn: (args) => {
                return contextClient.get('v1', args, { selector: getContextSelector });
            },
        };
    }

    public async createContextClientQuery(
        init: ModuleInitializerArgs<IContextModuleConfigurator, [ServicesModule]>
    ): Promise<QueryCtorOptions<ContextItem[], QueryContextParameters>['client']> {
        const provider = await init.requireInstance('services');
        const contextClient = await provider.createContextClient('json$');
        return {
            fn: (query) => {
                return contextClient.query('v1', { query }, { selector: queryContextSelector });
            },
        };
    }

    public async createConfig(
        init: ModuleInitializerArgs<IContextModuleConfigurator, [ServicesModule]>
    ) {
        const config: IContextModuleConfig = {
            getContext: {
                query: {
                    client: await this.createContextClientGet(init),
                    key: ({ id }) => id,
                    expire: this.defaultExpireTime,
                },
            },
            queryContext: {
                client: await this.createContextClientQuery(init),
                key: (args) => JSON.stringify(args),
                expire: this.defaultExpireTime,
            },
        };

        return this.processConfig(config);
    }

    public processConfig(config: IContextModuleConfig): IContextModuleConfig {
        return config;
    }
}

export default ContextModuleConfigurator;
