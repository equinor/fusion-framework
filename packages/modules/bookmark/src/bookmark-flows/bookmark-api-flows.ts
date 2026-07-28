import { of, type Observable } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import type { Flow } from '@equinor/fusion-observable';

import type { BookmarkActions } from '../bookmark-actions';
import type { BookmarkState } from '../create-bookmark-store';
import type { IBookmarkClient } from '../BookmarkClient.interface';

import { handleFetchBookmark } from './handle-fetch-bookmark';
import { handleFetchBookmarkData } from './handle-fetch-bookmark-data';
import { handleFetchAllBookmark } from './handle-fetch-all-bookmark';
import { handleCreateBookmark } from './handle-create-bookmark';
import { handleUpdateBookmark } from './handle-update-bookmark';
import { handleDeleteBookmark } from './handle-delete-bookmark';
import { handleRemoveBookmark } from './handle-remove-bookmark';
import { handleRemoveBookmarkFromFavorites } from './handle-remove-bookmark-from-favorites';
import { handleAddBookmarkAsFavorite } from './handle-add-bookmark-as-favorite';

/**
 * Defines a set of flows that handle various bookmark-related actions, such as fetching, creating, updating, and deleting bookmarks.
 *
 * @param api - An instance of `IBookmarkClient` that provides the necessary API methods for interacting with the bookmark service.
 * @returns A combined flow that handles all the bookmark-related actions.
 */
export const bookmarkApiFlows = (api: IBookmarkClient): Flow<BookmarkActions, BookmarkState> => {
  /**
   * Combines multiple Bookmark-related observable flows into a single observable stream.
   * The resulting observable stream emits the combined effects of these flows,
   * which can be used to update the application state.
   */
  return (actions$: Observable<BookmarkActions>, state$: Observable<BookmarkState>) =>
    // Invoke every bookmark flow with the shared api client and merge their emissions.
    of(
      handleFetchBookmark,
      handleFetchBookmarkData,
      handleFetchAllBookmark,
      handleCreateBookmark,
      handleUpdateBookmark,
      handleDeleteBookmark,
      handleRemoveBookmark,
      handleRemoveBookmarkFromFavorites,
      handleAddBookmarkAsFavorite,
    ).pipe(mergeMap((flow) => flow(api)(actions$, state$)));
};
