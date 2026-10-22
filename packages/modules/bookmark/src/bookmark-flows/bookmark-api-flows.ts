import { of, type Observable } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import type { Flow } from '@equinor/fusion-observable';

import type { BookmarkActions } from '../bookmark-actions.js';
import type { BookmarkFetchCancellation, BookmarkState } from '../create-bookmark-store.js';
import type { IBookmarkClient } from '../BookmarkClient.interface.js';

import { handleFetchBookmark } from './handle-fetch-bookmark.js';
import { handleFetchBookmarkData } from './handle-fetch-bookmark-data.js';
import { handleFetchAllBookmark } from './handle-fetch-all-bookmark.js';
import { handleCreateBookmark } from './handle-create-bookmark.js';
import { handleUpdateBookmark } from './handle-update-bookmark.js';
import { handleDeleteBookmark } from './handle-delete-bookmark.js';
import { handleRemoveBookmark } from './handle-remove-bookmark.js';
import { handleRemoveBookmarkFromFavorites } from './handle-remove-bookmark-from-favorites.js';
import { handleAddBookmarkAsFavorite } from './handle-add-bookmark-as-favorite.js';

/**
 * Defines a set of flows that handle various bookmark-related actions, such as fetching, creating, updating, and deleting bookmarks.
 *
 * @param api - An instance of `IBookmarkClient` that provides the necessary API methods for interacting with the bookmark service.
 * @param onFetchCancelled - Optional cleanup of telemetry observers for superseded fetches.
 * @returns A combined flow that handles all the bookmark-related actions.
 */
export const bookmarkApiFlows = (
  api: IBookmarkClient,
  onFetchCancelled?: BookmarkFetchCancellation,
): Flow<BookmarkActions, BookmarkState> => {
  /**
   * Combines multiple Bookmark-related observable flows into a single observable stream.
   * The resulting observable stream emits the combined effects of these flows,
   * which can be used to update the application state.
   */
  const flows = [
    handleFetchBookmark(api, onFetchCancelled),
    handleFetchBookmarkData(api, onFetchCancelled),
    handleFetchAllBookmark(api),
    handleCreateBookmark(api),
    handleUpdateBookmark(api),
    handleDeleteBookmark(api),
    handleRemoveBookmark(api),
    handleRemoveBookmarkFromFavorites(api),
    handleAddBookmarkAsFavorite(api),
  ];
  return (actions$: Observable<BookmarkActions>, state$: Observable<BookmarkState>) => {
    // Each flow shares the same business action stream without duplicating requests.
    const outputs = flows.map((flow) => flow(actions$, state$));
    // Keep every independent bookmark operation flow active.
    return of(...outputs).pipe(mergeMap((flow) => flow));
  };
};
