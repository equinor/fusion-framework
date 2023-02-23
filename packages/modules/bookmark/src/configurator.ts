import { ModuleInitializerArgs, ModulesInstanceType } from '@equinor/fusion-framework-module';
import { IHttpClient } from '@equinor/fusion-framework-module-http';
import { IApiProvider, ServicesModule } from '@equinor/fusion-framework-module-services';
import { BookmarksApiClient } from '@equinor/fusion-framework-module-services/bookmarks';
import { QueryCtorOptions } from '@equinor/fusion-query';
import { getBookmarkIdFormURL } from './utils/handle-url';

import { BookmarkConfigBuilder, BookmarkConfigBuilderCallback } from './bookmark-config-builder';
import { Bookmark, GetAllBookmarksParameters, GetBookmarkParameters, SourceSystem } from './types';

export interface BookmarkModuleConfig {
    resolveBookmarkId?(): string | null;
    appRoute?(appKey: string): string;
    sourceSystem: SourceSystem;
    queryClientConfig: {
        getAllBookmarks: QueryCtorOptions<Array<Bookmark<unknown>>, GetAllBookmarksParameters>;
        getBookmarkById: QueryCtorOptions<Bookmark<unknown>, GetBookmarkParameters>;
    };
    client: BookmarksApiClient<'fetch', IHttpClient, Bookmark<unknown>>;
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

    public async createConfig(
        init: ModuleInitializerArgs<IBookmarkModuleConfigurator, [ServicesModule]>
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

        if (!config.resolveBookmarkId) {
            config.resolveBookmarkId = getBookmarkIdFormURL;
        }

        if (!config.appRoute) {
            config.appRoute = (appKey: string) => `/apps/${appKey}`;
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

        return config as BookmarkModuleConfig;
    }
}
