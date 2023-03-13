export {
    BookmarkModuleConfigurator,
    IBookmarkModuleConfigurator,
    BookmarkModuleConfig,
} from './configurator';

export {
    default,
    BookmarkModule,
    module as bookmarkModule,
    moduleKey as bookmarkModuleKey,
} from './module';

export { IBookmarkModuleProvider, BookmarkModuleProvider } from './bookmark-provider';

export { enableBookmark } from './enable-bookmark';

export * from './types';
