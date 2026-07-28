import { of, from } from 'rxjs';
import { concatMap, map, catchError, filter, last } from 'rxjs/operators';

import { type Flow, type Observable } from '@equinor/fusion-observable';

import { bookmarkActions as actions, type BookmarkActions } from '../BookmarkProvider.actions';
import type { IBookmarkClient } from '../BookmarkClient.interface';
import { BookmarkFlowError } from '../BookmarkProvider.error';

/**
 * Creates a Flow for handling creating bookmarks.
 *
 * @param api - An instance of the `IBookmarkClient` interface, which provides the necessary API methods for creating bookmarks.
 * @returns A flow that listens for `createBookmark` actions, creates a new bookmark using the provided API.
 */
export const handleCreateBookmark =
  (api: IBookmarkClient): Flow<BookmarkActions> =>
  (action$: Observable<BookmarkActions>) => {
    /**
     * This flow listens for the `createBookmark` action, and then uses the `api.createBookmark` function to create a new bookmark.
     * If the bookmark is created successfully, it dispatches the `createBookmark.success` action with the new bookmark.
     * If there is an error creating the bookmark, it dispatches the `fetchBookmark.failure` action with an error.
     *
     * The `concatMap` operator is used to prevent aborting the request if a new `createBookmark` action is dispatched while the previous request is in flight.
     */
    const flow$ = action$.pipe(
      filter(actions.createBookmark.match),
      concatMap((action) => {
        return from(api.createBookmark(action.payload))
          // wait for the final emission before mapping to a success/failure action
          .pipe(
            last(),
            map((bookmark) => actions.createBookmark.success(bookmark, action.meta)),
            catchError((error) =>
              of(
                actions.createBookmark.failure(
                  new BookmarkFlowError('Failed to create new bookmark', action, {
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
