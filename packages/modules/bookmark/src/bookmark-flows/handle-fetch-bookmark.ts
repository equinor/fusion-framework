import { of } from 'rxjs';
import {
  throttleTime,
  groupBy,
  mergeMap,
  switchMap,
  map,
  catchError,
  filter,
  last,
} from 'rxjs/operators';

import { from } from 'rxjs';

import type { Flow } from '@equinor/fusion-observable';

import { bookmarkActions as actions, type BookmarkActions } from '../bookmark-actions';
import type { IBookmarkClient } from '../BookmarkClient.interface';
import { BookmarkFlowError } from '../BookmarkFlowError';

const defaultThrottleTime = 200;

/**
 * Handles the fetch bookmark action by making an API request to get the bookmark by its ID.
 *
 * @param api - The bookmark client API.
 * @returns A flow that handles the fetch bookmark action.
 */
export const handleFetchBookmark =
  (api: IBookmarkClient): Flow<BookmarkActions> =>
  (action$) => {
    /**
     * Observable that represents the flow of fetching bookmarks.
     * It listens for `fetchBookmark` actions, makes an API request to get the bookmark by ID,
     * and emits corresponding success or failure actions based on the API response.
     */
    const flow$ = action$.pipe(
      filter(actions.fetchBookmark.match),
      // group requests by bookmark id so throttling only applies per-id
      groupBy((action) => action.payload),
      mergeMap((group) =>
        // avoid flooding the API with repeated requests for the same bookmark
        group.pipe(throttleTime(defaultThrottleTime)),
      ),
      switchMap((action) =>
        from(api.getBookmarkById(action.payload)).pipe(
          last(),
          map((bookmark) => actions.fetchBookmark.success(bookmark, action.meta)),
          catchError((error) =>
            of(
              actions.fetchBookmark.failure(
                new BookmarkFlowError('Failed to fetch bookmark', action, {
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
