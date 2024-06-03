import { switchMap, map, catchError, filter, from, of, concatMap, merge } from 'rxjs';

import { Flow, Observable, getBaseType } from '@equinor/fusion-observable';

import { bookmarkActions, BookmarkActions } from './BookmarkProvider.actions';
import { IBookmarkClient } from './BookmarkClient.interface';
import { BookmarkState } from './BookmarkProvider.reducer';
import { BookmarkFlowError } from './BookmarkProvider.error';

/**
 * Creates a Flow for handling fetching bookmarks.
 *
 * @param api - An instance of the `IBookmarkClient` interface, which provides the necessary API methods for fetching bookmarks.
 * @returns An RxJS flow that handles the `fetchBookmark` action.
 */
export const handleFetchBookmark =
    (api: IBookmarkClient): Flow<BookmarkActions, BookmarkState> =>
    (action$: Observable<BookmarkActions>) => {
        return action$.pipe(
            filter(bookmarkActions.fetchBookmark.match),
            switchMap((action) => {
                return from(api.getBookmarkById(action.payload)).pipe(
                    map((bookmark) => bookmarkActions.fetchBookmark.success(bookmark)),
                    catchError((error) =>
                        of(
                            bookmarkActions.fetchBookmark.failure(
                                new BookmarkFlowError('Failed to fetch bookmark', action, {
                                    cause: error,
                                }),
                            ),
                        ),
                    ),
                );
            }),
        );
    };

/**
 * Creates a Flow for handling fetching all bookmarks.
 *
 * @param api - An instance of the `IBookmarkClient` interface, which provides the necessary API methods for fetching bookmarks.
 * @returns A flow that handles the `fetchBookmarks` action for the provided API client.
 */
export const handleFetchAllBookmark =
    (api: IBookmarkClient): Flow<BookmarkActions, BookmarkState> =>
    (action$: Observable<BookmarkActions>) => {
        return action$.pipe(
            filter(bookmarkActions.fetchBookmarks.match),
            switchMap((action) =>
                from(api.getAllBookmarks()).pipe(
                    map(bookmarkActions.fetchBookmarks.success),
                    catchError((error) =>
                        of(
                            bookmarkActions.fetchBookmark.failure(
                                new BookmarkFlowError('Failed to fetch all bookmarks', action, {
                                    cause: error,
                                }),
                            ),
                        ),
                    ),
                ),
            ),
        );
    };

/**
 * Creates a Flow for handling creating bookmarks.
 *
 * @param api - An instance of the `IBookmarkClient` interface, which provides the necessary API methods for creating bookmarks.
 * @returns A flow that listens for `createBookmark` actions, creates a new bookmark using the provided API.
 */
export const handleCreateBookmark =
    (api: IBookmarkClient): Flow<BookmarkActions, BookmarkState> =>
    (action$: Observable<BookmarkActions>) => {
        return action$.pipe(
            filter(bookmarkActions.createBookmark.match),
            switchMap((action) => {
                return from(api.createBookmark(action.payload)).pipe(
                    map((bookmark) => bookmarkActions.createBookmark.success(bookmark)),
                    catchError((error) =>
                        of(
                            bookmarkActions.fetchBookmark.failure(
                                new BookmarkFlowError('Failed to create new bookmark', action, {
                                    cause: error,
                                }),
                            ),
                        ),
                    ),
                );
            }),
        );
    };

/**
 * Creates a Flow for handling updating bookmarks.
 *
 * @param api - An instance of the `IBookmarkClient` interface, which provides the necessary API methods for updating bookmarks.
 * @returns A flow that listens for `updateBookmark` actions, updates the bookmark using the provided API.
 */
export const handleUpdateBookmark =
    (api: IBookmarkClient): Flow<BookmarkActions, BookmarkState> =>
    (action$: Observable<BookmarkActions>) => {
        return action$.pipe(
            filter(bookmarkActions.updateBookmark.match),
            switchMap((action) => {
                return from(api.updateBookmark(action.payload)).pipe(
                    map((bookmark) => bookmarkActions.updateBookmark.success(bookmark)),
                    catchError((error) =>
                        of(
                            bookmarkActions.fetchBookmark.failure(
                                new BookmarkFlowError('Failed to update bookmark', action, {
                                    cause: error,
                                }),
                            ),
                        ),
                    ),
                );
            }),
        );
    };

/**
 * Creates a flow for handling deleting bookmarks.
 *
 * @param api - An instance of the `IBookmarkClient` interface, which provides the necessary API methods for deleting bookmarks.
 * @returns A flow that listens for `deleteBookmark` actions, deletes the bookmark using the provided API.
 */
export const handleDeleteBookmark =
    (api: IBookmarkClient): Flow<BookmarkActions, BookmarkState> =>
    (action$: Observable<BookmarkActions>) => {
        return action$.pipe(
            filter(bookmarkActions.deleteBookmark.match),
            concatMap((action) =>
                from(api.deleteBookmark(action.payload)).pipe(
                    map(() => bookmarkActions.deleteBookmark.success(action.payload)),
                    catchError((error) =>
                        of(
                            bookmarkActions.fetchBookmark.failure(
                                new BookmarkFlowError('Failed to delete bookmark', action, {
                                    cause: error,
                                }),
                            ),
                        ),
                    ),
                ),
            ),
        );
    };

/**
 * Creates a Flow for handling deleting bookmarks.
 *
 * @param api - An instance of the `IBookmarkClient` interface, which provides the necessary API methods for managing favorite bookmarks.
 * @returns A flow that listens for `removeBookmarkAsFavorite` actions, removes the bookmark from the user's favorites using the provided API.
 */
export const handleRemoveBookmarkFromFavorites =
    (api: IBookmarkClient): Flow<BookmarkActions, BookmarkState> =>
    (action$: Observable<BookmarkActions>) => {
        return action$.pipe(
            filter(bookmarkActions.removeBookmarkAsFavorite.match),
            concatMap((action) =>
                from(api.removeBookmarkFromFavorites(action.payload)).pipe(
                    map(() => bookmarkActions.removeBookmarkAsFavorite.success(action.payload)),
                    catchError((error) =>
                        of(
                            bookmarkActions.fetchBookmark.failure(
                                new BookmarkFlowError(
                                    'Failed to remove bookmark as favorite',
                                    action,
                                    {
                                        cause: error,
                                    },
                                ),
                            ),
                        ),
                    ),
                ),
            ),
        );
    };

/**
 * Creates a Flow for handling adding bookmarks to favorites.
 *
 * @param api - An instance of the `IBookmarkClient` interface, which provides the necessary API methods for managing favorite bookmarks.
 * @returns A flow that listens for the `addBookmarkAsFavorite` action, calls the `addBookmarkToFavorites` method on the API.
 */
export const handleAddBookmarkAsFavorite =
    (api: IBookmarkClient): Flow<BookmarkActions, BookmarkState> =>
    (action$: Observable<BookmarkActions>) => {
        return action$.pipe(
            filter(bookmarkActions.addBookmarkAsFavorite.match),
            concatMap((action) =>
                from(api.addBookmarkToFavorites(action.payload)).pipe(
                    map(() => bookmarkActions.addBookmarkAsFavorite.success(action.payload)),
                    catchError((error) =>
                        of(
                            bookmarkActions.fetchBookmark.failure(
                                new BookmarkFlowError(
                                    'Failed to add bookmark as favorite',
                                    action,
                                    {
                                        cause: error,
                                    },
                                ),
                            ),
                        ),
                    ),
                ),
            ),
        );
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
    (api: IBookmarkClient): Flow<BookmarkActions, BookmarkState> =>
    (action$) => {
        // filter failure actions related to removing or deleting the bookmark
        const failure$ = merge(
            action$.pipe(filter(bookmarkActions.deleteBookmark.failure.match)),
            action$.pipe(filter(bookmarkActions.removeBookmarkAsFavorite.failure.match)),
        ).pipe(map((actionS) => bookmarkActions.removeBookmark.failure(actionS.payload)));

        // filter success actions related to removing or deleting the bookmark
        const success$ = merge(
            action$.pipe(filter(bookmarkActions.deleteBookmark.success.match)),
            action$.pipe(filter(bookmarkActions.removeBookmarkAsFavorite.success.match)),
        ).pipe(
            map((action) =>
                bookmarkActions.removeBookmark.success({
                    type: getBaseType(action.type),
                    bookmarkID: action.payload,
                }),
            ),
        );

        // filter removeBookmark actions and dispatch the appropriate action for removing or deleting the bookmark
        const dispatch$ = action$.pipe(
            filter(bookmarkActions.removeBookmark.match),
            concatMap(({ payload: bookmarkId }) => {
                return from(api.isBookmarkFavorite(bookmarkId)).pipe(
                    map((isFavorite) => {
                        const action = isFavorite
                            ? bookmarkActions.removeBookmarkAsFavorite
                            : bookmarkActions.deleteBookmark;
                        return action(bookmarkId);
                    }),
                );
            }),
        );

        return merge(failure$, success$, dispatch$);
    };

/**
 * Create a flow for handling bookmark selection.
 *
 * @param api - The bookmark client API to use for fetching bookmark data.
 * @returns A flow that handles the `setActiveBookmark` action.
 */
export const handleSetActiveBookmark =
    (api: IBookmarkClient): Flow<BookmarkActions, BookmarkState> =>
    (action$) =>
        action$.pipe(
            filter(bookmarkActions.setActiveBookmark.match),
            concatMap((action) => {
                if (action.payload === null) {
                    return of(bookmarkActions.setActiveBookmark.success(null));
                }
                return from(api.getBookmarkData(action.payload)).pipe(
                    map(bookmarkActions.setActiveBookmark.success),
                    catchError((error) =>
                        of(
                            bookmarkActions.fetchBookmark.failure(
                                new BookmarkFlowError(
                                    'Failed to add bookmark as favorite',
                                    action,
                                    {
                                        cause: error,
                                    },
                                ),
                            ),
                        ),
                    ),
                );
            }),
        );

export const bookmarkApiFlows =
    (api: IBookmarkClient): Flow<BookmarkActions, BookmarkState> =>
    (actions$, state$) =>
        merge(
            ...[
                handleFetchBookmark,
                handleFetchAllBookmark,
                handleSetActiveBookmark,
                handleCreateBookmark,
                handleUpdateBookmark,
                handleDeleteBookmark,
                handleRemoveBookmark,
                handleRemoveBookmarkFromFavorites,
                handleAddBookmarkAsFavorite,
            ].map((flow) => flow(api)(actions$, state$)),
        );
