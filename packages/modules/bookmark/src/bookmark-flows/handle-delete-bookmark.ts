import { of, from } from 'rxjs';
import { concatMap, map, catchError, filter, last } from 'rxjs/operators';

import type { Flow, Observable } from '@equinor/fusion-observable';

import { bookmarkActions as actions, type BookmarkActions } from '../bookmark-actions';
import type { IBookmarkClient } from '../BookmarkClient.interface';
import { BookmarkFlowError } from '../BookmarkFlowError';

/**
 * Creates a flow for handling deleting bookmarks.
 *
 * @param api - An instance of the `IBookmarkClient` interface, which provides the necessary API methods for deleting bookmarks.
 * @returns A flow that listens for `deleteBookmark` actions, deletes the bookmark using the provided API.
 */
export const handleDeleteBookmark =
  (api: IBookmarkClient): Flow<BookmarkActions> =>
  (action$: Observable<BookmarkActions>) => {
    /**
     * - Listens for the `deleteBookmark` action.
     * - Calls the `api.deleteBookmark` function to delete the bookmark.
     * - Maps the successful response to the `deleteBookmark.success` action.
     * - Handles errors by dispatching the `fetchBookmark.failure` action with a `BookmarkFlowError`.
     * - Uses `concatMap` to prevent aborting the request if a new action is dispatched while the previous request is in flight.
     */
    const flow$ = action$.pipe(
      filter(actions.deleteBookmark.match),
      concatMap((action) =>
        from(api.deleteBookmark(action.payload)).pipe(
          last(),
          map(() => actions.deleteBookmark.success(action.payload, action.meta)),
          catchError((error) =>
            of(
              actions.deleteBookmark.failure(
                new BookmarkFlowError('Failed to delete bookmark', action, {
                  cause: error,
                }),
                action.meta,
              ),
            ),
          ),
        ),
      ),
    );
    return flow$;
  };
