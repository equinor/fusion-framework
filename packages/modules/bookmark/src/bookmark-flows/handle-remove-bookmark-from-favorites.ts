import { of, from } from 'rxjs';
import { concatMap, map, catchError, filter, last } from 'rxjs/operators';

import { type Flow, type Observable } from '@equinor/fusion-observable';

import { bookmarkActions as actions, type BookmarkActions } from '../BookmarkProvider.actions';
import type { IBookmarkClient } from '../BookmarkClient.interface';
import { BookmarkFlowError } from '../BookmarkProvider.error';

/**
 * Creates a Flow for handling removing a bookmark from favorites.
 *
 * @param api - An instance of the `IBookmarkClient` interface, which provides the necessary API methods for managing favorite bookmarks.
 * @returns A flow that listens for `removeBookmarkAsFavorite` actions, removes the bookmark from the user's favorites using the provided API.
 */
export const handleRemoveBookmarkFromFavorites =
  (api: IBookmarkClient): Flow<BookmarkActions> =>
  (action$: Observable<BookmarkActions>) => {
    /**
     * - Listens for the `removeBookmarkAsFavourite` action.
     * - Calls the `api.removeBookmarkFromFavorites` function to remove the bookmark from favorites.
     * - On success, dispatches the `removeBookmarkAsFavourite.success` action.
     * - On error, dispatches the `fetchBookmark.failure` action with a `BookmarkFlowError`.
     * - Uses `concatMap` to prevent aborting the request if a new action is dispatched while the previous request is in flight.
     */
    const flow$ = action$.pipe(
      filter(actions.removeBookmarkAsFavourite.match),
      // use concatMap to prevent aborting the request if a new action is dispatched while the previous request is in flight
      concatMap((action) =>
        from(api.removeBookmarkFromFavorites(action.payload)).pipe(
          last(),
          map(() => actions.removeBookmarkAsFavourite.success(action.payload, action.meta)),
          catchError((error) =>
            of(
              actions.removeBookmarkAsFavourite.failure(
                new BookmarkFlowError('Failed to remove bookmark as favorite', action, {
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
