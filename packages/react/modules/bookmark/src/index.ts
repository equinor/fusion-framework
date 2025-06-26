export { default, useCurrentBookmark, type useCurrentBookmarkReturn } from './useCurrentBookmark';
export { useBookmark, type useBookmarkResult } from './useBookmark';
export { useBookmarkProvider } from './useBookmarkProvider';

export { enableBookmark, bookmarkWithDataSchema } from '@equinor/fusion-framework-module-bookmark';

export type {
  Bookmark,
  Bookmarks,
  BookmarkData,
  BookmarkModule,
  BookmarkProvider,
  BookmarkPayloadGenerator,
} from '@equinor/fusion-framework-module-bookmark';
