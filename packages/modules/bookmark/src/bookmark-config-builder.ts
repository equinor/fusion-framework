import {
    AnyModule,
    ModuleInitializerArgs,
    Modules,
    ModuleType,
} from '@equinor/fusion-framework-module';
import { IEventModuleProvider } from '@equinor/fusion-framework-module-event';

import { QueryCtorOptions, QueryFn } from '@equinor/fusion-query';
import { CreateBookmarkFn } from 'bookmark-provider';

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

    setSourceSystem(sourceSystem: SourceSystem) {
        this.config.sourceSystem = sourceSystem;
    }

    setBookmarkIdResolver(fn: () => string | null) {
        this.config.resolveBookmarkId = fn;
    }

    setContextIdResolver(fn: () => string | undefined) {
        this.config.getContextId = fn;
    }
    setAppResolver(fn: () => string | undefined) {
        this.config.getAppIdentification = fn;
    }
    setEventProvider(provider: IEventModuleProvider) {
        this.config.event = provider;
    }

    setCurrentAppProvider(cb: () => Record<string, CreateBookmarkFn<unknown>>) {
        this.config.getCurrentAppCreator = cb;
    }

    setBookmarkClient(
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
        this.config.queryClientConfig = {
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
