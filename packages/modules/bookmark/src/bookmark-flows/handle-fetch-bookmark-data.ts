import { of, from } from 'rxjs';
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

import type { Flow } from '@equinor/fusion-observable';

import { bookmarkActions as actions, type BookmarkActions } from '../bookmark-actions.js';
import type { BookmarkFetchCancellation } from '../create-bookmark-store.js';
import type { IBookmarkClient } from '../BookmarkClient.interface.js';
import { BookmarkFlowError } from '../BookmarkFlowError.js';

const defaultThrottleTime = 200;

/**
 * Creates a flow for handling fetching bookmark data.
 *
 * @param api - The bookmark client API.
 * @param onFetchCancelled - Optional telemetry cleanup when a newer request supersedes this fetch.
 * @returns A flow of bookmark actions.
 */
export const handleFetchBookmarkData =
  (api: IBookmarkClient, onFetchCancelled?: BookmarkFetchCancellation): Flow<BookmarkActions> =>
  (action$) => {
    // throttle requests per bookmark id, then fetch the data and dispatch success/failure
    const flow$ = action$.pipe(
      filter(actions.fetchBookmarkData.match),
      // group requests by bookmark id so throttling only applies per-id
      groupBy((action) => JSON.stringify(action.payload)),
      mergeMap((group) =>
        // avoid flooding the API with repeated requests for the same bookmark
        group.pipe(throttleTime(defaultThrottleTime)),
      ),
      switchMap((action) => {
        let settled = false;
        // wait for the final emission before mapping to a success/failure action
        return from(api.getBookmarkData(action.payload)).pipe(
          last(),
          map((data) => {
            settled = true;
            return actions.fetchBookmarkData.success(action.payload, data, action.meta);
          }),
          catchError((error) => {
            settled = true;
            return of(
              actions.fetchBookmarkData.failure(
                new BookmarkFlowError('Failed to fetch bookmark payload', action, {
                  cause: error,
                }),
                action.meta,
              ),
            );
          }),
          finalize(() => {
            // A superseded switchMap inner has no terminal action to release its tracker.
            if (!settled && action.meta?.ref) {
              onFetchCancelled?.('payload-resolve', action.meta.ref);
            }
          }),
        );
      }),
    );
    return flow$;
  };
