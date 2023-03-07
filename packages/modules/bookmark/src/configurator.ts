import { ModuleInitializerArgs, ModulesInstanceType } from '@equinor/fusion-framework-module';
import { IHttpClient } from '@equinor/fusion-framework-module-http';
import { IApiProvider, ServicesModule } from '@equinor/fusion-framework-module-services';
import { BookmarksApiClient } from '@equinor/fusion-framework-module-services/bookmarks';
import { QueryCtorOptions } from '@equinor/fusion-query';
import { getBookmarkIdFormURL } from './utils/handle-url';

import { BookmarkConfigBuilder, BookmarkConfigBuilderCallback } from './bookmark-config-builder';
import { Bookmark, GetAllBookmarksParameters, GetBookmarkParameters, SourceSystem } from './types';
import { ContextModule, IContextProvider } from '@equinor/fusion-framework-module-context';
import {
    AppModule,
    AppModuleProvider,
    AppModulesInstance,
} from '@equinor/fusion-framework-module-app';
import { EventModule, IEventModuleProvider } from '@equinor/fusion-framework-module-event';
import { CreateBookmarkFn, IBookmarkProvider } from './bookmark-provider';
import { BookmarkClient } from './client/bookmarkClient';
import { BookmarkModule } from './module';

export interface BookmarkModuleConfig {
    getContextId: () => string | undefined;
    getCurrentAppIdentification?(): string | undefined;
    resolveBookmarkId?(): string | null;
    appRoute(appKey: string): string;
    sourceSystem: SourceSystem;
    queryClientConfig: {
        getAllBookmarks: QueryCtorOptions<Array<Bookmark<unknown>>, GetAllBookmarksParameters>;
        getBookmarkById: QueryCtorOptions<Bookmark<unknown>, GetBookmarkParameters>;
    };
    client: BookmarksApiClient<'fetch', IHttpClient, Bookmark<unknown>>;
    event?: IEventModuleProvider;
    bookmarkClient: BookmarkClient;
    isParent: boolean;
    getCurrentAppStateCreator(): Record<string, CreateBookmarkFn<unknown>> | undefined;
    navigateByBookmark?: <TData>(bookmark: TData) => string;
}

export type IBookmarkModuleConfigurator = {
    addConfigBuilder(init: BookmarkConfigBuilderCallback): void;
};

export class BookmarkModuleConfigurator implements IBookmarkModuleConfigurator {
    defaultExpireTime = 1 * 60 * 1000;

    #configBuilders: Array<BookmarkConfigBuilderCallback> = [];

    addConfigBuilder(init: BookmarkConfigBuilderCallback): void {
        this.#configBuilders.push(init);
    }

    protected async _getServiceProvider(
        init: ModuleInitializerArgs<IBookmarkModuleConfigurator, [ServicesModule]>
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

    protected async _getContextProvider(
        init: ModuleInitializerArgs<IBookmarkModuleConfigurator, [ContextModule]>
    ): Promise<IContextProvider> {
        if (init.hasModule('context')) {
            return init.requireInstance('context');
        } else {
            const parentContextModule = (init.ref as ModulesInstanceType<[ContextModule]>)?.context;
            if (parentContextModule) {
                return parentContextModule;
            }
            throw Error('no context provider configures [ContextModule]');
        }
    }

    protected async _getAppProvider(
        init: ModuleInitializerArgs<IBookmarkModuleConfigurator, [AppModule]>
    ): Promise<AppModuleProvider> {
        if (init.hasModule('app')) {
            return init.requireInstance('app');
        } else {
            const parentAppModule = (init.ref as ModulesInstanceType<[AppModule]>)?.app;
            if (parentAppModule) {
                return parentAppModule;
            }
            throw Error('no app provider configures [AppModule]');
        }
    }
    protected async _getEventProvider(
        init: ModuleInitializerArgs<IBookmarkModuleConfigurator, [EventModule]>
    ): Promise<IEventModuleProvider> {
        if (init.hasModule('event')) {
            return init.requireInstance('event');
        } else {
            const parentEventModule = (init.ref as ModulesInstanceType<[EventModule]>)?.event;
            if (parentEventModule) {
                return parentEventModule;
            }
            throw Error('no event provider configures [EventModule]');
        }
    }

    public async createConfig(
        init: ModuleInitializerArgs<
            IBookmarkModuleConfigurator,
            [ServicesModule, AppModule, ContextModule]
        >,
        ref?: IBookmarkProvider
    ): Promise<BookmarkModuleConfig> {
        const config: Partial<BookmarkModuleConfig> = await this.#configBuilders.reduce(
            async (cur, cb) => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const builder = new BookmarkConfigBuilder<any, any>(init, await cur);
                await Promise.resolve(cb(builder));
                return Object.assign(cur, builder.config);
            },
            Promise.resolve({} as Partial<BookmarkModuleConfig>)
        );

        config.isParent = ref ? false : true;
        const appProvider = await this._getAppProvider(init);

        if (ref) {
            config.sourceSystem = ref.config.sourceSystem;
            config.getContextId = ref.config.getContextId;
            config.getCurrentAppIdentification = ref.config.getCurrentAppIdentification;
            config.bookmarkClient = ref.config.bookmarkClient;
        }

        if (!config.resolveBookmarkId) {
            config.resolveBookmarkId = getBookmarkIdFormURL;
        }

        if (!config.appRoute) {
            config.appRoute = (appKey: string) => `/apps/${appKey}`;
        }

        if (!config.getCurrentAppIdentification) {
            config.getCurrentAppIdentification = () => appProvider.current?.appKey;
        }

        if (!config.getCurrentAppStateCreator) {
            config.getCurrentAppStateCreator = () => {
                if (!appProvider.current) return;
                const currentAppBookmarkProvider = (
                    appProvider.current.instance as AppModulesInstance<[BookmarkModule]>
                ).bookmark;

                return currentAppBookmarkProvider.bookmarkCreators;
            };
        }

        if (!config.getContextId) {
            const contextProvider = await this._getContextProvider(init);
            config.getContextId = () => {
                return contextProvider.currentContext?.id;
            };
        }

        if (!config.sourceSystem) {
            config.sourceSystem = {
                subSystem: 'CLI',
                identifier: 'fusion-cli',
                name: 'Fusion CLI',
            };
        }

        if (!config.event) {
            const event = await this._getEventProvider(init);
            config.event = event;
        }

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

        config.bookmarkClient = ref
            ? ref.bookmarkClient
            : new BookmarkClient(config as BookmarkModuleConfig);

        return config as BookmarkModuleConfig;
    }
}
