import { of, from } from 'rxjs';
import { throttleTime, groupBy, switchMap, map, catchError, filter, last } from 'rxjs/operators';

import type { Flow, Observable } from '@equinor/fusion-observable';

import { bookmarkActions as actions, type BookmarkActions } from '../bookmark-actions';
import type { IBookmarkClient } from '../BookmarkClient.interface';
import { BookmarkFlowError } from '../BookmarkFlowError';

const defaultThrottleTime = 200;

/**
 * Creates a Flow for handling fetching users bookmarks.
 *
 * @param api - The bookmark API client to use for fetching bookmarks.
 * @returns An observable that emits the result of the bookmark fetch operation.
 */
export const handleFetchAllBookmark =
  (api: IBookmarkClient): Flow<BookmarkActions> =>
  (action$: Observable<BookmarkActions>) => {
    /**
     * This flow is triggered by the `fetchBookmarks` action and uses the `throttleTime` operator
     * to limit the number of requests made to the API. The `switchMap` operator is used to make
     * the API call and map the response to the appropriate action (success or failure).
     */
    const flow$ = action$.pipe(
      filter(actions.fetchBookmarks.match),
      // group requests by filter so throttling only applies per-filter
      groupBy((action) => JSON.stringify(action.payload)),
      switchMap((group) =>
        // avoid flooding the API with repeated requests for the same filter
        group.pipe(throttleTime(defaultThrottleTime)),
      ),
      switchMap((action) =>
        // Map the API call outcome to a success or failure action for this filter.
        from(api.getAllBookmarks(action.payload)).pipe(
          last(),
          map((value) => actions.fetchBookmarks.success(value, action.meta)),
          catchError((error) =>
            of(
              actions.fetchBookmarks.failure(
                new BookmarkFlowError('Failed to fetch all bookmarks', action, {
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
