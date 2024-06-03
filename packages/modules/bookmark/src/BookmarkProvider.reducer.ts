import {
    ActionBaseType,
    createReducer,
    getBaseType,
    isCompleteAction,
    isFailureAction,
    isRequestAction,
} from '@equinor/fusion-observable';
import { Bookmark, BookmarkData } from './types';
import { bookmarkActions, BookmarkActions } from './BookmarkProvider.actions';
import { BookmarkFlowError } from './BookmarkProvider.error';

const getBookmarkBaseAction = <T extends BookmarkActions>(action: T): ActionBaseType<T> => {
    return getBaseType(action.type) as ActionBaseType<T>;
};

export type BookmarkState = {
    status: Set<ActionBaseType<BookmarkActions>>;
    errors: Record<ActionBaseType<BookmarkActions>, BookmarkFlowError>;
    ActiveBookmark?: BookmarkData | null;
    bookmarks: Record<string, Bookmark>;
};

const initialState: BookmarkState = {
    status: new Set<ActionBaseType<BookmarkActions>>(),
    errors: {} as Record<ActionBaseType<BookmarkActions>, BookmarkFlowError>,
    bookmarks: {},
};

export const reducer = createReducer<BookmarkState, BookmarkActions>(initialState, (builder) => {
    builder
        .addCase(bookmarkActions.setActiveBookmark.success, (state, action) => {
            state.ActiveBookmark = action.payload;
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
        .addCase(bookmarkActions.removeBookmark.success, (state, action) => {
            delete state.bookmarks[action.payload.bookmarkID];
        })
        // add all request actions to the status set
        .addMatcher(isRequestAction, (state, action) => {
            const actionName = getBookmarkBaseAction(action);
            // add new status for the action type
            state.status.add(actionName);
        })
        .addMatcher(isCompleteAction, (state, action) => {
            const actionName = getBookmarkBaseAction(action);
            // remove status for the action type
            state.status.delete(actionName);
            // remove errors for the action type
            delete state.errors[actionName];
        })
        // when a request fails, add the error to the errors array
        .addMatcher(isFailureAction, (state, action) => {
            const actionName = getBookmarkBaseAction(action);
            state.errors[actionName] = action.payload;
        });
});
