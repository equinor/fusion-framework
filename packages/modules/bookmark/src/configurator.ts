import { getBookmarkIdFormURL } from './utils/handle-url';
import { BookmarkConfigBuilder, BookmarkConfigBuilderCallback } from './bookmark-config-builder';

import type { ModuleInitializerArgs, ModulesInstanceType } from '@equinor/fusion-framework-module';
import type { IApiProvider, ServicesModule } from '@equinor/fusion-framework-module-services';
import type { SourceSystem } from './types';
import type { ContextModule, IContextProvider } from '@equinor/fusion-framework-module-context';
import type { AppModule, AppModuleProvider } from '@equinor/fusion-framework-module-app';
import type { EventModule, IEventModuleProvider } from '@equinor/fusion-framework-module-event';
import type { IBookmarkModuleProvider } from './bookmark-provider';

import type { BookmarkClientConfig } from './client/bookmarkClient';

export interface BookmarkModuleConfig {
    /**
     *  SourceSystem used when creating a new bookmark,
     *  used as the identifier for the current client. Only used in app shell / portal configuration.
     */
    sourceSystem: SourceSystem;

    /**
     *  The clintConfiguration consist of both Api client configuration and query client configuration
     */
    clientConfiguration: BookmarkClientConfig;

    /**
     * It is possible to associate a Fusion context with a bookmark and this function is used to resolve the current context id applied.
     * @returns - should return a fusion context id.
     */
    getContextId: () => string | undefined;

    /**
     * A bookmark kan be connected to a application this is used to resolve the current applications appKey.
     */
    getCurrentAppIdentification?(): string | undefined;

    /**
     * The resolves bookmarkId at startup, default configured to resolve id form URL with query parm
     * ?bookmarkId=GUID but this can be resolved for any where if needed.
     */
    resolveBookmarkId?(): string | null;

    /**
     * default set to Fusion Events Module.
     */
    event?: IEventModuleProvider;
}

export type IBookmarkModuleConfigurator = {
    /**
     * @param init BookmarkConfigBuilderCallback for configuring the bookmark module.
     * Configuration is only needed for application shell / portals.
     */
    addConfigBuilder(init: BookmarkConfigBuilderCallback): void;
    /**
     * Bookmark Config Factory Providing default configuration if no configuration is provided.
     * @param init ModuleInitializerArgs<IBookmarkModuleConfigurator, [ServicesModule, AppModule, ContextModule]>
     * @param parentProvider Parent IBookmarkModuleProvider
     */
    createConfig(
        init: ModuleInitializerArgs<
            IBookmarkModuleConfigurator,
            [ServicesModule, AppModule, ContextModule]
        >,
        parentProvider?: IBookmarkModuleProvider,
    ): Promise<BookmarkModuleConfig>;
};

export class BookmarkModuleConfigurator implements IBookmarkModuleConfigurator {
    defaultExpireTime = 1 * 60 * 1000;

    #configBuilders: Array<BookmarkConfigBuilderCallback> = [];

    addConfigBuilder(init: BookmarkConfigBuilderCallback): void {
        this.#configBuilders.push(init);
    }

    async createConfig(
        init: ModuleInitializerArgs<
            IBookmarkModuleConfigurator,
            [ServicesModule, AppModule, ContextModule]
        >,
        parentProvider?: IBookmarkModuleProvider,
    ): Promise<BookmarkModuleConfig> {
        const config: Partial<BookmarkModuleConfig> = await this.#configBuilders.reduce(
            async (cur, cb) => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const builder = new BookmarkConfigBuilder<any, any>(init, await cur);
                await Promise.resolve(cb(builder));
                return Object.assign(cur, builder.config);
            },
            Promise.resolve({} as Partial<BookmarkModuleConfig>),
        );

        const appProvider = await this._getAppProvider(init);

        this.#applyParentProviderConfiguration(parentProvider, config);

        if (!config.resolveBookmarkId) {
            config.resolveBookmarkId = getBookmarkIdFormURL;
        }

        if (!config.getCurrentAppIdentification) {
            config.getCurrentAppIdentification = () => appProvider.current?.appKey;
        }

        if (!config.getContextId) {
            const contextProvider = await this._getContextProvider(init);
            config.getContextId = () => {
                return contextProvider.currentContext?.id;
            };
        }

        if (!config.event) {
            const event = await this._getEventProvider(init);
            config.event = event;
        }

        config.clientConfiguration = await this._createClientConfiguration(
            init,
            config.clientConfiguration,
        );

        if (!config.sourceSystem) {
            throw Error('missing sourceSystem configuration');
        }

        return config as BookmarkModuleConfig;
    }

    #applyParentProviderConfiguration(
        parentProvider: IBookmarkModuleProvider | undefined,
        config: Partial<BookmarkModuleConfig>,
    ) {
        if (parentProvider) {
            config.clientConfiguration = parentProvider.config.clientConfiguration;
            config.sourceSystem = parentProvider.config.sourceSystem;
            config.getContextId = parentProvider.config.getContextId;
            config.getCurrentAppIdentification = parentProvider.config.getCurrentAppIdentification;
        }
    }

    protected async _createClientConfiguration(
        init: ModuleInitializerArgs<
            IBookmarkModuleConfigurator,
            [ServicesModule, AppModule, ContextModule]
        >,
        config: Partial<BookmarkClientConfig> = {},
    ): Promise<BookmarkClientConfig> {
        if (!config.client) {
            const apiProvider = await this._getServiceProvider(init);
            config.client = await apiProvider.createBookmarksClient('fetch');
        }

        if (!config.queryClientConfig) {
            const apiProvider = await this._getServiceProvider(init);
            const bookmarkClient = await apiProvider.createBookmarksClient('json$');

            config.queryClientConfig = {
                getBookmarkById: {
                    client: {
                        fn: (args) => bookmarkClient.get('v1', args),
                    },
                    key: ({ id }) => id,
                    expire: this.defaultExpireTime,
                },
                getAllBookmarks: {
                    client: {
                        fn: () => bookmarkClient.getAll('v1'),
                    },
                    key: () => 'all-bookmarks',
                    validate: ({ args }) => args.isValid,
                    expire: this.defaultExpireTime,
                },
                ...bookmarkClient,
            };
        }

        return config as BookmarkClientConfig;
    }

    protected async _getServiceProvider(
        init: ModuleInitializerArgs<IBookmarkModuleConfigurator, [ServicesModule]>,
    ): Promise<IApiProvider> {
        if (init.hasModule('services')) {
            return init.requireInstance('services');
        } else {
            const parentServiceModule = (init.ref as ModulesInstanceType<[ServicesModule]>)
                ?.services;
            if (parentServiceModule) {
                return parentServiceModule;
            }
            throw Error('[BookmarkConfigurator] No service provider configures [ServicesModule] ');
        }
    }

    protected async _getContextProvider(
        init: ModuleInitializerArgs<IBookmarkModuleConfigurator, [ContextModule]>,
    ): Promise<IContextProvider> {
        if (init.hasModule('context')) {
            return init.requireInstance('context');
        } else {
            const parentContextModule = (init.ref as ModulesInstanceType<[ContextModule]>)?.context;
            if (parentContextModule) {
                return parentContextModule;
            }
            throw Error('[BookmarkConfigurator] No context provider configures [ContextModule]');
        }
    }

    protected async _getAppProvider(
        init: ModuleInitializerArgs<IBookmarkModuleConfigurator, [AppModule]>,
    ): Promise<AppModuleProvider> {
        if (init.hasModule('app')) {
            return init.requireInstance('app');
        } else {
            const parentAppModule = (init.ref as ModulesInstanceType<[AppModule]>)?.app;
            if (parentAppModule) {
                return parentAppModule;
            }
            throw Error('[BookmarkConfigurator] No app provider configures [AppModule]');
        }
    }
    protected async _getEventProvider(
        init: ModuleInitializerArgs<IBookmarkModuleConfigurator, [EventModule]>,
    ): Promise<IEventModuleProvider> {
        if (init.hasModule('event')) {
            return init.requireInstance('event');
        } else {
            const parentEventModule = (init.ref as ModulesInstanceType<[EventModule]>)?.event;
            if (parentEventModule) {
                return parentEventModule;
            }
            throw Error('[BookmarkConfigurator] No event provider configures [EventModule]');
        }
    }
}

export default BookmarkModuleConfigurator;
