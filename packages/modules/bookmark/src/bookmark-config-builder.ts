import {
    AnyModule,
    ModuleInitializerArgs,
    Modules,
    ModuleType,
} from '@equinor/fusion-framework-module';
import { IEventModuleProvider } from '@equinor/fusion-framework-module-event';
import { IHttpClient } from '@equinor/fusion-framework-module-http';
import { BookmarksApiClient } from '@equinor/fusion-framework-module-services/bookmarks';

import { QueryCtorOptions, QueryFn } from '@equinor/fusion-query';

import {
    BookmarkModuleConfig,
    BookmarkModuleConfigurator,
    IBookmarkModuleConfigurator,
} from './configurator';
import { Bookmark, GetAllBookmarksParameters, GetBookmarkParameters, SourceSystem } from './types';

export type BookmarkConfigBuilderCallback = <TDeps extends Array<AnyModule> = []>(
    builder: BookmarkConfigBuilder<TDeps, ModuleInitializerArgs<IBookmarkModuleConfigurator, TDeps>>
) => void | Promise<void>;

export class BookmarkConfigBuilder<
    TModules extends Array<AnyModule> = [],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    TInit extends ModuleInitializerArgs<any, any> = ModuleInitializerArgs<
        BookmarkModuleConfigurator,
        TModules
    >
> {
    #init: TInit;
    constructor(init: TInit, public config: Partial<BookmarkModuleConfig> = {}) {
        this.#init = init;
    }

    requireInstance<TKey extends string = Extract<keyof Modules, string>>(
        module: TKey
    ): Promise<ModuleType<Modules[TKey]>>;

    requireInstance<T>(module: string): Promise<T>;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    requireInstance(module: string): Promise<any> {
        return this.#init.requireInstance(module);
    }

    /**
     *
     * This will sett the SourceSystem used when creating a new bookmark,
     * used as the identifier for the current client. Only used in app shell / portal configuration.
     *
     * @param {SourceSystem} sourceSystem
     * ```ts
     * interface SourceSystem {
     *  identifier: string;
     *  name: string;
     *  subSystem: string;
     * }
     * ```
     * @memberof BookmarkConfigBuilder
     */
    setSourceSystem(sourceSystem: SourceSystem) {
        this.config.sourceSystem = sourceSystem;
    }

    /**
     * Used to over write the default  Url id resolving.
     *
     * @param {(() => string | null)} fn - Resolver for bookmarkId
     * @memberof BookmarkConfigBuilder
     */
    setBookmarkIdResolver(fn: () => string | null) {
        this.config.resolveBookmarkId = fn;
    }

    /**
     * This allow for custom BookmarkApiClient to be added.
     *
     * @param {BookmarksApiClient<'fetch', IHttpClient, Bookmark<unknown>>} client - Custom Api client
     * @memberof BookmarkConfigBuilder
     */
    serCustomBookmarkApiClient(
        client: BookmarksApiClient<'fetch', IHttpClient, Bookmark<unknown>>
    ) {
        if (this.config.clintConfiguration) {
            this.config.clintConfiguration.client = client;
        }
    }

    /**
     * Used to over withe the default context id resolver.
     *
     * @param {(() => string | undefined)} fn - Function for providing current contextId
     * @memberof BookmarkConfigBuilder
     */
    setContextIdResolver(fn: () => string | undefined) {
        this.config.getContextId = fn;
    }

    /**
     * Used to over withe the default configuration fot the path resolver for
     * the application related to the bookmark.
     *
     * @param {((appKey: string) => string)} fn - Function for providing the navigation path.
     * @memberof BookmarkConfigBuilder
     */
    setAppPathResolver(fn: (appKey: string) => string) {
        this.config.getAppPath = fn;
    }

    /**
     * Used to over withe the default function for getting the current applications
     * key identifier.
     *
     * @param {(() => string | undefined)}  - A function for getting the current application key
     * @memberof BookmarkConfigBuilder
     */
    setCurrentAppIdResolver(fn: () => string | undefined) {
        this.config.getCurrentAppIdentification = fn;
    }

    /**
     * Enable the over write default Event provider if needed.
     * Should not be used if all event providers are changes in the current environment
     *
     * @param {IEventModuleProvider} provider - Custom Event provider
     * @memberof BookmarkConfigBuilder
     */
    setEventProvider(provider: IEventModuleProvider) {
        this.config.event = provider;
    }

    /**
     * Use for override the bookmark query client
     *
     * @param {({
     *             getAllBookmarks:
     *                 | QueryFn<Array<Bookmark<unknown>>, GetAllBookmarksParameters>
     *                 | QueryCtorOptions<Array<Bookmark<unknown>>, GetAllBookmarksParameters>;
     *             getBookmarkById:
     *                 | QueryFn<Bookmark<unknown>, GetBookmarkParameters>
     *                 | QueryCtorOptions<Bookmark<unknown>, GetBookmarkParameters>;
     *         })} client - Custom client definition.
     * @param {number} [expire=1 * 60 * 1000] - Time which queries expire.
     * @memberof BookmarkConfigBuilder
     */
    setBookmarkQueryClient(
        client: {
            getAllBookmarks:
                | QueryFn<Array<Bookmark<unknown>>, GetAllBookmarksParameters>
                | QueryCtorOptions<Array<Bookmark<unknown>>, GetAllBookmarksParameters>;
            getBookmarkById:
                | QueryFn<Bookmark<unknown>, GetBookmarkParameters>
                | QueryCtorOptions<Bookmark<unknown>, GetBookmarkParameters>;
        },
        expire: number = 1 * 60 * 1000
    ): void {
        if (this.config.clintConfiguration) {
            this.config.clintConfiguration.queryClientConfig = {
                getAllBookmarks:
                    typeof client.getAllBookmarks === 'function'
                        ? {
                              key: () => 'all-bookmarks',
                              client: {
                                  fn: client.getAllBookmarks,
                              },
                              validate: ({ args }) => args.isValid,
                          }
                        : client.getAllBookmarks,
                getBookmarkById:
                    typeof client.getBookmarkById === 'function'
                        ? {
                              key: ({ id }) => id,
                              client: {
                                  fn: client.getBookmarkById,
                              },
                              expire,
                          }
                        : client.getBookmarkById,
            };
        }
    }
}
