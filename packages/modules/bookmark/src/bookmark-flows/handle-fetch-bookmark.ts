import { of } from 'rxjs';
import {
  throttleTime,
  groupBy,
  mergeMap,
  switchMap,
  map,
  catchError,
  filter,
  finalize,
  last,
} from 'rxjs/operators';

import { from } from 'rxjs';

import type { Flow } from '@equinor/fusion-observable';

import { bookmarkActions as actions, type BookmarkActions } from '../bookmark-actions.js';
import type { BookmarkFetchCancellation } from '../create-bookmark-store.js';
import type { IBookmarkClient } from '../BookmarkClient.interface.js';
import { BookmarkFlowError } from '../BookmarkFlowError.js';

const defaultThrottleTime = 200;

/**
 * Handles the fetch bookmark action by making an API request to get the bookmark by its ID.
 *
 * @param api - The bookmark client API.
 * @param onFetchCancelled - Optional telemetry cleanup when a newer request supersedes this fetch.
 * @returns A flow that handles the fetch bookmark action.
 */
export const handleFetchBookmark =
  (api: IBookmarkClient, onFetchCancelled?: BookmarkFetchCancellation): Flow<BookmarkActions> =>
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
      switchMap((action) => {
        let settled = false;
        // Map the API call outcome to a success or failure action for this bookmark.
        return from(api.getBookmarkById(action.payload)).pipe(
          last(),
          map((bookmark) => {
            settled = true;
            return actions.fetchBookmark.success(bookmark, action.meta);
          }),
          catchError((error) => {
            settled = true;
            return of(
              actions.fetchBookmark.failure(
                new BookmarkFlowError('Failed to fetch bookmark', action, {
                  cause: error,
                }),
                action.meta,
              ),
            );
          }),
          finalize(() => {
            // A superseded switchMap inner has no terminal action to release its tracker.
            if (!settled && action.meta?.ref) {
              onFetchCancelled?.('get', action.meta.ref);
            }
          }),
        );
      }),
    );
    return flow$;
  };
