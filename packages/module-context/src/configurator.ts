import {
    AnyModule,
    ModuleInitializerArgs,
    ModulesInstanceType,
} from '@equinor/fusion-framework-module';
import { ServicesModule, IApiProvider } from '@equinor/fusion-framework-module-services';
import type { QueryCtorOptions } from '@equinor/fusion-query';
import { ContextClientOptions } from './client/ContextClient';
import { ContextItem, QueryContextParameters } from './types';
import { getContextSelector, queryContextSelector } from './selectors';

export interface IContextModuleConfig {
    getContext: ContextClientOptions;
    queryContext: QueryCtorOptions<ContextItem[], QueryContextParameters>;
    contextType?: string[];
    contextFilter?: (items: Array<ContextItem>) => Array<ContextItem>;
}

export interface IContextModuleConfigurator<TDeps extends Array<AnyModule> = [ServicesModule]> {
    /** fired on initialize of module */
    createConfig: (
        args: ModuleInitializerArgs<IContextModuleConfigurator, TDeps>
    ) => Promise<IContextModuleConfig>;

    /** post process function for altering created config  */
    processConfig: (config: IContextModuleConfig) => IContextModuleConfig;
}

export class ContextModuleConfigurator implements IContextModuleConfigurator<[ServicesModule]> {
    getContext?: Promise<ContextClientOptions['query']['client']>;

    defaultExpireTime = 1 * 60 * 1000;

    protected async _createContextClientGet(
        apiProvider: IApiProvider
    ): Promise<QueryCtorOptions<ContextItem, { id: string }>['client']> {
        const contextClient = await apiProvider.createContextClient('json$');
        return {
            fn: (args) => {
                return contextClient.get('v1', args, { selector: getContextSelector });
            },
        };
    }

    protected async _createContextClientQuery(
        apiProvider: IApiProvider
    ): Promise<QueryCtorOptions<ContextItem[], QueryContextParameters>['client']> {
        const contextClient = await apiProvider.createContextClient('json$');
        return {
            fn: (query) => {
                return contextClient.query('v1', { query }, { selector: queryContextSelector });
            },
        };
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
    ) {
        const apiProvider = await this._getServiceProvider(init);
        const config: IContextModuleConfig = {
            getContext: {
                query: {
                    client: await this._createContextClientGet(apiProvider),
                    key: ({ id }) => id,
                    expire: this.defaultExpireTime,
                },
            },
            queryContext: {
                client: await this._createContextClientQuery(apiProvider),
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
