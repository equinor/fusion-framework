import { AnyModule, ModuleInitializerArgs } from '@equinor/fusion-framework-module';
import { ServicesModule } from '@equinor/fusion-framework-module-services';
import { QueryCtorOptions } from '@equinor/fusion-observable/query';
import { BookmarkClientOptions } from 'client/bookmarkCLient';
import { ApiBookmarkEntityV1 } from './types';

export interface IBookmarkModuleConfig {
    getBookmark: BookmarkClientOptions;
}

export interface IBookmarkModuleConfigurator<TDeps extends Array<AnyModule> = [ServicesModule]> {
    /** fired on initialize of module */
    createConfig: (
        args: ModuleInitializerArgs<IBookmarkModuleConfigurator, TDeps>
    ) => Promise<IBookmarkModuleConfig>;

    /** fired on initialize of module */
    createBookmarkClientGet(
        init: ModuleInitializerArgs<IBookmarkModuleConfigurator, [ServicesModule]>
    ): Promise<QueryCtorOptions<ApiBookmarkEntityV1<unknown>, { id: string }>['client']>;
}

export class BookmarkModuleConfigurator implements IBookmarkModuleConfigurator<[ServicesModule]> {
    getBookmark?: Promise<BookmarkClientOptions['query']['client']>;

    public async createBookmarkClientGet(
        init: ModuleInitializerArgs<IBookmarkModuleConfigurator, [ServicesModule]>
    ): Promise<QueryCtorOptions<ApiBookmarkEntityV1<unknown>, { id: string }>['client']> {
        const provider = await init.requireInstance('services');
        const bookmarkClient = await provider.createBookmarksClient('json$');
        return {
            fn: (args) => {
                return bookmarkClient.get('v1', args);
            },
        };
    }

    public async createConfig(
        init: ModuleInitializerArgs<IBookmarkModuleConfigurator, [ServicesModule]>
    ) {
        return {
            getBookmark: {
                query: {
                    client: await this.createBookmarkClientGet(init),
                    key: ({ id }) => id,
                },
            },
        } as IBookmarkModuleConfig;
    }
}

export default BookmarkModuleConfigurator;
