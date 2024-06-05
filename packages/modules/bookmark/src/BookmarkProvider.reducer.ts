import {
    createReducer,
    getBaseType,
    isCompleteAction,
    isFailureAction,
    isRequestAction,
    isSuccessAction,
    type ActionBaseType,
} from '@equinor/fusion-observable';

import { bookmarkActions, type BookmarkActions } from './BookmarkProvider.actions';
import { type BookmarkState } from './BookmarkProvider.store';
import { BookmarkFlowError } from './BookmarkProvider.error';

import type { Bookmark } from './types';

/**
 * Utility function that extracts the base action type from a given action object.
 */
const getBookmarkBaseAction = <T extends BookmarkActions>(action: T): ActionBaseType<T> => {
    return getBaseType(action.type) as ActionBaseType<T>;
};

/**
 * The default initial state for the BookmarkProvider reducer.
 */
const defaultInitialState: BookmarkState = {
    status: new Set<ActionBaseType<BookmarkActions>>(),
    errors: {} as Record<ActionBaseType<BookmarkActions>, BookmarkFlowError>,
    bookmarks: {},
};

/**
 * Creates a reducer for managing the state of bookmarks.
 *
 * @param initialState - The initial state of the bookmarks.
 * @returns A reducer function for managing the bookmarks state.
 */
export const createBookmarkReducer = (initialState: BookmarkState = defaultInitialState) =>
    createReducer<BookmarkState, BookmarkActions>(initialState, (builder) => {
        builder
            .addCase(bookmarkActions.clearActiveBookmark, (state) => {
                state.activeBookmark = null;
            })
            .addCase(bookmarkActions.setActiveBookmark.success, (state, action) => {
                state.activeBookmark = action.payload;
            })
            .addCase(bookmarkActions.fetchBookmark.success, (state, action) => {
                state.bookmarks[action.payload.id] = action.payload;
            })
            .addCase(bookmarkActions.fetchBookmarks.success, (state, action) => {
                state.bookmarks = action.payload.reduce(
                    (acc, bookmark) => {
                        acc[bookmark.id] = bookmark;
                        return acc;
                    },
                    {} as Record<string, Bookmark>,
                );
            })
            .addCase(bookmarkActions.createBookmark.success, (state, action) => {
                state.bookmarks[action.payload.id] = action.payload;
            })
            .addCase(bookmarkActions.updateBookmark.success, (state, action) => {
                state.bookmarks[action.payload.id] = action.payload;
            })

            /** removal of bookmarks */
            .addCase(bookmarkActions.deleteBookmark.success, (state, action) => {
                delete state.bookmarks[action.meta.ref];
            })
            .addCase(bookmarkActions.removeBookmarkAsFavourite.success, (state, action) => {
                delete state.bookmarks[action.meta.ref];
            })

            /** when a request is made, add the action type to the status object */
            .addMatcher(isRequestAction, (state, action) => {
                const actionName = getBookmarkBaseAction(action);
                state.status.add(actionName);
            })

            /** when a request succeeds, remove the error from the errors object */
            .addMatcher(isSuccessAction, (state, action) => {
                const actionName = getBookmarkBaseAction(action);
                delete state.errors[actionName];
            })

            /** when a request fails, add the error to the errors object */
            .addMatcher(isFailureAction, (state, action) => {
                const actionName = getBookmarkBaseAction(action);
                state.errors[actionName] = action.payload;
            })

            /** when a request is complete, remove the status from the status set */
            .addMatcher(isCompleteAction, (state, action) => {
                const actionName = getBookmarkBaseAction(action);
                state.status.delete(actionName);
            });
    });
