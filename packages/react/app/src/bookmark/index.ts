/**
 * Bookmark sub-path entry-point.
 *
 * Provides helpers to enable and consume the Fusion bookmark module,
 * allowing users to save and restore application state snapshots.
 *
 * @packageDocumentation
 */
export { enableBookmark } from '@equinor/fusion-framework-app/enable-bookmark';

export { useCurrentBookmark } from './useCurrentBookmark.js';
export { useBookmark } from './useBookmark.js';

export type {
  Bookmark,
  Bookmarks,
  BookmarkData,
  BookmarkPayloadGenerator,
  BookmarkProvider,
} from '@equinor/fusion-framework-react-module-bookmark';
