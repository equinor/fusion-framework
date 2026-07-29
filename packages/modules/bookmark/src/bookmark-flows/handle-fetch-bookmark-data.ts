import { of, from } from 'rxjs';
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

import type { Flow } from '@equinor/fusion-observable';

import { bookmarkActions as actions, type BookmarkActions } from '../bookmark-actions';
import type { IBookmarkClient } from '../BookmarkClient.interface';
import { BookmarkFlowError } from '../BookmarkFlowError';

const defaultThrottleTime = 200;

/**
 * Creates a flow for handling fetching bookmark data.
 *
 * @param api - The bookmark client API.
 * @returns A flow of bookmark actions.
 */
export const handleFetchBookmarkData =
  (api: IBookmarkClient): Flow<BookmarkActions> =>
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
        // wait for the final emission before mapping to a success/failure action
        return from(api.getBookmarkData(action.payload)).pipe(
          last(),
          map((data) => actions.fetchBookmarkData.success(action.payload, data, action.meta)),
          catchError((error) =>
            of(
              actions.fetchBookmarkData.failure(
                new BookmarkFlowError('Failed to fetch bookmark payload', action, {
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
