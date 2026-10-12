export {
  default,
  useCurrentBookmark,
  type useCurrentBookmarkReturn,
} from './useCurrentBookmark.js';
export { useBookmark, type useBookmarkResult } from './useBookmark.js';
export { useBookmarkProvider } from './useBookmarkProvider.js';

export { enableBookmark, bookmarkWithDataSchema } from '@equinor/fusion-framework-module-bookmark';

export type {
  Bookmark,
  Bookmarks,
  BookmarkData,
  BookmarkModule,
  BookmarkProvider,
  BookmarkPayloadGenerator,
} from '@equinor/fusion-framework-module-bookmark';
