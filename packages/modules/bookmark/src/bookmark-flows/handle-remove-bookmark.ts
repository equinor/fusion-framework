import { concat, merge, from } from 'rxjs';
import { map, concatMap, filter } from 'rxjs/operators';

import { type Flow, getBaseType } from '@equinor/fusion-observable';

import { bookmarkActions as actions, type BookmarkActions } from '../BookmarkProvider.actions';
import type { IBookmarkClient } from '../BookmarkClient.interface';

/**
 * Creates a flow for handling bookmark removal.
 *
 * This function observes actions related to deleting a bookmark or removing a bookmark as a favorite, and dispatches the appropriate actions for each case.
 * If the bookmark is currently a favorite, it will dispatch an action to remove it as a favorite.
 * If the bookmark is not a favorite, it will dispatch an action to delete it.
 *
 * @param api - An instance of the `IBookmarkClient` interface, which provides the necessary API methods checking if bookmarks are favorites.
 * @returns A flow that handles the removal of a bookmark.
 */
export const handleRemoveBookmark =
  (api: IBookmarkClient): Flow<BookmarkActions> =>
  (action$) => {
    /**
     * Handles the removal of a bookmark from the application.
     *
     * This function is responsible for determining whether the bookmark being removed is a favorite or not,
     * and then dispatching the appropriate action to either remove the bookmark as a favorite or delete the bookmark entirely.
     *
     * Uses `concatMap` to prevent aborting the request if a new action is dispatched while the previous request is in flight.
     */
    const dispatch$ = action$.pipe(
      filter(actions.removeBookmark.match),
      concatMap(({ payload: bookmarkId }) => {
        // pick which action to dispatch based on the bookmark's favorite status
        return from(api.isBookmarkFavorite(bookmarkId)).pipe(
          map((isFavorite) => {
            const action = isFavorite ? actions.removeBookmarkAsFavourite : actions.deleteBookmark;
            return action(bookmarkId);
          }),
        );
      }),
    );

    /**
     * Handles failures for deleting a bookmark or removing a bookmark as a favorite.
     */
    const failure$ = merge(
      action$.pipe(filter(actions.deleteBookmark.failure.match)),
      action$.pipe(filter(actions.removeBookmarkAsFavourite.failure.match)),
    ).pipe(map((action) => actions.removeBookmark.failure(action.payload, action.meta)));

    /**
     * Handles the success of deleting a bookmark or removing a bookmark as a favorite.
     */
    const success$ = merge(
      action$.pipe(filter(actions.deleteBookmark.success.match)),
      action$.pipe(filter(actions.removeBookmarkAsFavourite.success.match)),
    ).pipe(
      map((action) =>
        actions.removeBookmark.success(
          {
            type: getBaseType(action.type),
            bookmarkId: action.payload,
          },
          action.meta,
        ),
      ),
    );

    /**
     * First dispatch either deletions of bookmark or removals of bookmarks as favorites.
     * Then observer the results of those actions and dispatch the appropriate actions.
     */
    const flow$ = concat(dispatch$, merge(failure$, success$));

    return flow$;
  };
