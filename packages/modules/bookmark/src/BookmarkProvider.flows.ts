import { from, of, merge, concat } from 'rxjs';
import {
    switchMap,
    map,
    catchError,
    filter,
    concatMap,
    throttleTime,
    mergeAll,
} from 'rxjs/operators';

import { type Flow, type Observable, getBaseType } from '@equinor/fusion-observable';

import { bookmarkActions as actions, type BookmarkActions } from './BookmarkProvider.actions';
import type { IBookmarkClient } from './BookmarkClient.interface';
import type { BookmarkState } from './BookmarkProvider.store';
import { BookmarkFlowError } from './BookmarkProvider.error';

/**
 * Creates a flow for handling fetching a bookmark.
 *
 * @param api - The bookmark API client to use for fetching the bookmark.
 * @param options - Optional configuration options, including a throttle delay in milliseconds.
 * @returns A flow that handles the fetching of a bookmark.
 */
export const handleFetchBookmark =
    (api: IBookmarkClient, options?: { throttle?: number }): Flow<BookmarkActions> =>
    (action$: Observable<BookmarkActions>) => {
        /**
         * This flow is triggered by the `fetchBookmark` action, which is dispatched when a bookmark needs to be fetched.
         * The flow first throttles the incoming actions to prevent excessive requests, then uses the `api.getBookmarkById` function
         * to fetch the bookmark. If the fetch is successful, the `fetchBookmark.success` action is dispatched with the fetched bookmark.
         * If an error occurs during the fetch, the `fetchBookmark.failure` action is dispatched with an error object containing the cause of the failure.
         */
        const flow$ = action$.pipe(
            filter(actions.fetchBookmark.match),
            throttleTime(options?.throttle || 500),
            switchMap((action) =>
                from(api.getBookmarkById(action.payload)).pipe(
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

/**
 * Creates a Flow for handling fetching users bookmarks.
 *
 * @param api - The bookmark API client to use for fetching bookmarks.
 * @param options - Optional configuration options, including a `throttle` value in milliseconds.
 * @returns An observable that emits the result of the bookmark fetch operation.
 */
export const handleFetchAllBookmark =
    (api: IBookmarkClient, options?: { throttle?: number }): Flow<BookmarkActions> =>
    (action$: Observable<BookmarkActions>) => {
        /**
         * This flow is triggered by the `fetchBookmarks` action and uses the `throttleTime` operator
         * to limit the number of requests made to the API. The `switchMap` operator is used to make
         * the API call and map the response to the appropriate action (success or failure).
         */
        const flow$ = action$.pipe(
            filter(actions.fetchBookmarks.match),
            throttleTime(options?.throttle || 500),
            switchMap((action) =>
                from(api.getAllBookmarks()).pipe(
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
                return from(api.createBookmark(action.payload)).pipe(
                    map((bookmark) => actions.createBookmark.success(bookmark, action.meta)),
                    catchError((error) =>
                        of(
                            actions.fetchBookmark.failure(
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
            concatMap((action) =>
                from(api.updateBookmark(action.payload)).pipe(
                    map((bookmark) => actions.updateBookmark.success(bookmark, action.meta)),
                    catchError((error) =>
                        of(
                            actions.fetchBookmark.failure(
                                new BookmarkFlowError('Failed to update bookmark', action, {
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

/**
 * Creates a flow for handling deleting bookmarks.
 *
 * @param api - An instance of the `IBookmarkClient` interface, which provides the necessary API methods for deleting bookmarks.
 * @returns A flow that listens for `deleteBookmark` actions, deletes the bookmark using the provided API.
 */
export const handleDeleteBookmark =
    (api: IBookmarkClient): Flow<BookmarkActions> =>
    (action$: Observable<BookmarkActions>) => {
        /**
         * - Listens for the `deleteBookmark` action.
         * - Calls the `api.deleteBookmark` function to delete the bookmark.
         * - Maps the successful response to the `deleteBookmark.success` action.
         * - Handles errors by dispatching the `fetchBookmark.failure` action with a `BookmarkFlowError`.
         * - Uses `concatMap` to prevent aborting the request if a new action is dispatched while the previous request is in flight.
         */
        const flow$ = action$.pipe(
            filter(actions.deleteBookmark.match),
            concatMap((action) =>
                from(api.deleteBookmark(action.payload)).pipe(
                    map(() => actions.deleteBookmark.success(action.payload, action.meta)),
                    catchError((error) =>
                        of(
                            actions.fetchBookmark.failure(
                                new BookmarkFlowError('Failed to delete bookmark', action, {
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

/**
 * Creates a Flow for handling deleting bookmarks.
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
            // use concat to prevent aborting the request if a new action is dispatched while the previous request is in flight
            concatMap((action) =>
                from(api.removeBookmarkFromFavorites(action.payload)).pipe(
                    map(() =>
                        actions.removeBookmarkAsFavourite.success(action.payload, action.meta),
                    ),
                    catchError((error) =>
                        of(
                            actions.fetchBookmark.failure(
                                new BookmarkFlowError(
                                    'Failed to remove bookmark as favorite',
                                    action,
                                    {
                                        cause: error,
                                    },
                                ),
                                action.meta,
                            ),
                        ),
                    ),
                ),
            ),
        );

        return flow$;
    };

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
                    map(() => actions.addBookmarkAsFavourite.success(action.payload, action.meta)),
                    catchError((error) =>
                        of(
                            actions.addBookmarkAsFavourite.failure(
                                new BookmarkFlowError(
                                    'Failed to add bookmark as favorite',
                                    action,
                                    {
                                        cause: error,
                                    },
                                ),
                                action.meta,
                            ),
                        ),
                    ),
                ),
            ),
        );

        return flow$;
    };

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
                return from(api.isBookmarkFavorite(bookmarkId)).pipe(
                    map((isFavorite) => {
                        const action = isFavorite
                            ? actions.removeBookmarkAsFavourite
                            : actions.deleteBookmark;
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

export const handleBookmarkFavouriteAdded: Flow<BookmarkActions> = (action$) => {
    /**
     * When a bookmark is added as a favorite, we need to fetch the bookmark from the API.
     */
    const flow$ = action$.pipe(
        filter(actions.addBookmarkAsFavourite.success.match),
        map((action) => actions.fetchBookmark(action.payload, action.meta)),
    );

    return flow$;
};

/**
 * Creates a flow for setting the active bookmark.
 *
 * @param api - The bookmark API client.
 * @returns A flow that handles the `setActiveBookmark` action.
 */
export const handleSetActiveBookmark =
    (api: IBookmarkClient): Flow<BookmarkActions> =>
    (action$) => {
        /**
         * Handles the flow for setting the active bookmark.
         *
         * - Listens for the `setActiveBookmark` action.
         * - Fetches the bookmark data from the API.
         * - Maps the API response to a success action.
         * - Handles errors by mapping them to a failure action.
         */
        const flow$ = action$.pipe(
            filter(actions.setActiveBookmark.match),
            switchMap((action) =>
                from(api.getBookmarkData(action.payload)).pipe(
                    map((data) => actions.setActiveBookmark.success(data, action.meta)),
                    catchError((error) =>
                        of(
                            actions.setActiveBookmark.failure(
                                new BookmarkFlowError('Failed to fetch bookmark data', action, {
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

/**
 * Defines a set of flows that handle various bookmark-related actions, such as fetching, creating, updating, and deleting bookmarks.
 *
 * @param api - An instance of `IBookmarkClient` that provides the necessary API methods for interacting with the bookmark service.
 * @returns A combined flow that handles all the bookmark-related actions.
 */
export const bookmarkApiFlows = (api: IBookmarkClient): Flow<BookmarkActions, BookmarkState> => {
    const throttle = 500;
    /**
     * Combines multiple Bookmark-related observable flows into a single observable stream.
     *
     * The function then merges the following flows:
     * - `handleFetchBookmark`: Fetches a single bookmark from the API.
     * - `handleFetchAllBookmark`: Fetches all bookmarks from the API.
     * - `handleSetActiveBookmark`: Sets the active bookmark.
     * - `handleCreateBookmark`: Creates a new bookmark.
     * - `handleUpdateBookmark`: Updates an existing bookmark.
     * - `handleDeleteBookmark`: Deletes a bookmark.
     * - `handleRemoveBookmark`: Removes a bookmark.
     * - `handleRemoveBookmarkFromFavorites`: Removes a bookmark from the favorites.
     * - `handleAddBookmarkAsFavorite`: Adds a bookmark to the favorites.
     * - `handleBookmarkFavouriteAdded`: Fetches the bookmark data from the API when a bookmark is added as a favorite.
     *
     * The resulting observable stream emits the combined effects of these flows, which can be used to update the application state.
     */
    const flow$ = (actions$: Observable<BookmarkActions>, state$: Observable<BookmarkState>) =>
        merge(
            from([
                handleFetchBookmark(api, { throttle }),
                handleFetchAllBookmark(api, { throttle }),
                handleSetActiveBookmark(api),
                handleCreateBookmark(api),
                handleUpdateBookmark(api),
                handleDeleteBookmark(api),
                handleRemoveBookmark(api),
                handleRemoveBookmarkFromFavorites(api),
                handleAddBookmarkAsFavorite(api),
                handleBookmarkFavouriteAdded,
            ]).pipe(
                map((flow) => flow(actions$, state$)),
                mergeAll(),
            ),
        );
    return flow$;
};
