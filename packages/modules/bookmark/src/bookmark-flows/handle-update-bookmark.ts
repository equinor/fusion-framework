import { of, from } from 'rxjs';
import { concatMap, map, catchError, filter, last } from 'rxjs/operators';

import type { Flow, Observable } from '@equinor/fusion-observable';

import { bookmarkActions as actions, type BookmarkActions } from '../BookmarkProvider.actions';
import type { IBookmarkClient } from '../BookmarkClient.interface';
import { BookmarkFlowError } from '../BookmarkProvider.error';

/**
 * Creates a Flow for handling updating bookmarks.
 *
 * @param api - An instance of the `IBookmarkClient` interface, which provides the necessary API methods for updating bookmarks.
 * @returns A flow that listens for `updateBookmark` actions, updates the bookmark using the provided API.
 */
export const handleUpdateBookmark =
  (api: IBookmarkClient): Flow<BookmarkActions> =>
  (action$: Observable<BookmarkActions>) => {
    /**
     * This flow listens for `updateBookmark` actions, then calls the `api.updateBookmark` function with the action payload.
     * If the update is successful, it dispatches a `updateBookmark.success` action with the updated bookmark.
     * If there is an error, it dispatches a `fetchBookmark.failure` action with the error.
     *
     * The `concatMap` operator is used to prevent aborting the request if a new `updateBookmark` action is dispatched while the previous request is in flight.
     */
    const flow$ = action$.pipe(
      filter(actions.updateBookmark.match),
      concatMap((action) => {
        const { bookmarkId, updates } = action.payload;
        // wait for the final emission before mapping to a success/failure action
        return from(api.updateBookmark(bookmarkId, updates)).pipe(
          last(),
          map((bookmark) => actions.updateBookmark.success(bookmark, action.meta)),
          catchError((error) =>
            of(
              actions.updateBookmark.failure(
                new BookmarkFlowError('Failed to update bookmark', action, {
                  cause: error,
                }),
                action.meta,
              ),
            ),
          ),
        );
      }),
    );
    return flow$;
  };
