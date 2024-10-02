export { BookmarkModuleConfigurator } from './BookmarkConfigurator';

export type {
    IBookmarkClient,
    BookmarkNew,
    BookmarkUpdate,
    BookmarksFilter,
} from './BookmarkClient.interface';

export {
    default,
    BookmarkModule,
    module as bookmarkModule,
    moduleKey as bookmarkModuleKey,
} from './bookmark-module';

export {
    BookmarkProvider,
    type BookmarkPayloadGenerator,
    type BookmarkCreateArgs,
    type BookmarkUpdateOptions,
} from './BookmarkProvider';

export { enableBookmark } from './enable-bookmark';

export * from './types';
