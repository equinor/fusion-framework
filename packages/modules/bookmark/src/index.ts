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

export { BookmarkProvider } from './BookmarkProvider';

export type {
  BookmarkCreateArgs,
  BookmarkUpdateOptions,
  IBookmarkProvider,
  BookmarkPayloadGenerator,
} from './BookmarkProvider.interface';

export { enableBookmark } from './enable-bookmark';

export * from './types';
