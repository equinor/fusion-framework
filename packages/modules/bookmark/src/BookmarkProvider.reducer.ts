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
import type { BookmarkState } from './BookmarkProvider.store';
import type { BookmarkFlowError } from './BookmarkProvider.error';
import type { BookmarkWithoutData } from './types';
import { enableMapSet } from 'immer';

enableMapSet();

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
 * @todo add fast-deep-equal to compare bookmarks
 *
 * @param initialState - The initial state of the bookmarks.
 * @returns A reducer function for managing the bookmarks state.
 */
export const createBookmarkReducer = (initialState?: Partial<BookmarkState>) =>
  createReducer<BookmarkState, BookmarkActions>(
    { ...defaultInitialState, ...initialState },
    (builder) => {
      builder
        .addCase(bookmarkActions.fetchBookmark.success, (state, action) => {
          if (action.payload.id in state.bookmarks) {
            state.bookmarks[action.payload.id] = action.payload;
          }
        })
        .addCase(bookmarkActions.fetchBookmarkData.success, (state, action) => {
          const { bookmarkId, data } = action.payload;
          if (state.currentBookmark?.id === bookmarkId) {
            state.currentBookmark.payload = data;
          }
        })
        .addCase(bookmarkActions.fetchBookmarks.success, (state, action) => {
          // normalize the bookmarks array into a record
          state.bookmarks = action.payload.reduce(
            (acc, bookmark) => {
              acc[bookmark.id] = bookmark;
              return acc;
            },
            {} as Record<string, BookmarkWithoutData>,
          );
        })
        .addCase(bookmarkActions.setBookmark, (state, action) => {
          const bookmarkId = action.payload.id;
          if (bookmarkId in state.bookmarks) {
            state.bookmarks[bookmarkId] = action.payload;
          }
          if (state.currentBookmark?.id === bookmarkId) {
            state.currentBookmark = action.payload;
          }
        })
        .addCase(bookmarkActions.setCurrentBookmark, (state, action) => {
          state.currentBookmark = action.payload;
        })
        .addCase(bookmarkActions.createBookmark.success, (state, action) => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { payload, ...bookmark } = action.payload;
          state.bookmarks[bookmark.id] = bookmark;
        })
        .addCase(bookmarkActions.updateBookmark.success, (state, action) => {
          const bookmarkId = action.payload.id;
          const hasBookmark = bookmarkId in state.bookmarks;
          const isCurrent = state.currentBookmark?.id === bookmarkId;

          // get the current bookmark
          const current = hasBookmark
            ? state.bookmarks[bookmarkId]
            : isCurrent
              ? state.currentBookmark
              : null;

          // merge the current bookmark with the new data
          const next = { ...current, ...action.payload };

          // if the bookmark is in the current state, update it
          if (hasBookmark) {
            state.bookmarks[bookmarkId] = next;
          }

          // if the bookmark is the selected bookmark, update it
          if (isCurrent) {
            state.currentBookmark = next;
          }
        })

        /** removal of bookmarks */
        .addCase(bookmarkActions.deleteBookmark.success, (state, action) => {
          delete state.bookmarks[action.payload];
        })
        .addCase(bookmarkActions.removeBookmarkAsFavourite.success, (state, action) => {
          delete state.bookmarks[action.payload];
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
    },
  );
