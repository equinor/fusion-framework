import { of, from } from 'rxjs';
import { concatMap, map, catchError, filter, last } from 'rxjs/operators';

import { type Flow, type Observable } from '@equinor/fusion-observable';

import { bookmarkActions as actions, type BookmarkActions } from '../BookmarkProvider.actions';
import type { IBookmarkClient } from '../BookmarkClient.interface';
import { BookmarkFlowError } from '../BookmarkProvider.error';

/**
 * Handles the flow of adding a bookmark as a favorite.
 *
 * @param api - The `IBookmarkClient` API instance to use for interacting with bookmarks.
 * @returns An RxJS `Flow` that handles the `addBookmarkAsFavourite` action.
 */
export const handleAddBookmarkAsFavorite =
  (api: IBookmarkClient): Flow<BookmarkActions> =>
  (action$: Observable<BookmarkActions>) => {
    /**
     * Handles the flow for adding a bookmark as a favorite.
     *
     * This flow listens for the `addBookmarkAsFavourite` action, and then:
     * 1. Calls the `addBookmarkToFavorites` API to add the bookmark to the user's favorites.
     * 2. If the API call is successful, dispatches the `addBookmarkAsFavourite.success` action.
     * 3. If the API call fails, dispatches the `addBookmarkAsFavourite.failure` action with an error.
     */
    const flow$ = action$.pipe(
      filter(actions.addBookmarkAsFavourite.match),
      concatMap((action) =>
        from(api.addBookmarkToFavorites(action.payload)).pipe(
          last(),
          map(() => actions.addBookmarkAsFavourite.success(action.payload, action.meta)),
          catchError((error) =>
            of(
              actions.addBookmarkAsFavourite.failure(
                new BookmarkFlowError('Failed to add bookmark as favorite', action, {
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
