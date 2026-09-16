import {
  createReducer,
  getBaseType,
  isCompleteAction,
  isFailureAction,
  isRequestAction,
  isSuccessAction,
  type ActionBaseType,
} from '@equinor/fusion-observable';
import isEqual from 'fast-deep-equal';
import { enableMapSet } from 'immer';

import { bookmarkActions, type BookmarkActions } from './bookmark-actions';
import type { BookmarkState } from './create-bookmark-store';
import type { BookmarkFlowError } from './BookmarkFlowError';
import type { BookmarkWithoutData } from './types';

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
 * @param initialState - The initial state of the bookmarks.
 * @returns A reducer function for managing the bookmarks state.
 */
export const createBookmarkReducer = (initialState?: Partial<BookmarkState>) => {
  // Layer any provided overrides on top of the module's defaults for the initial state.
  const initial = { ...defaultInitialState, ...initialState };
  return createReducer<BookmarkState, BookmarkActions>(initial, (builder) => {
    builder
      .addCase(bookmarkActions.fetchBookmark.success, (state, action) => {
        const current = state.bookmarks[action.payload.id];
        // Preserve the state reference when a refresh returns an unchanged bookmark.
        if (current && !isEqual(current, action.payload)) {
          state.bookmarks[action.payload.id] = action.payload;
        }
      })
      .addCase(bookmarkActions.fetchBookmarkData.success, (state, action) => {
        const { bookmarkId, data } = action.payload;
        // Preserve the state reference when the current bookmark already has the fetched payload.
        if (
          state.currentBookmark?.id === bookmarkId &&
          !isEqual(state.currentBookmark.payload, data)
        ) {
          state.currentBookmark.payload = data;
        }
      })
      .addCase(bookmarkActions.fetchBookmarks.success, (state, action) => {
        // Build a lookup record keyed by bookmark ID for selector access.
        const bookmarks = action.payload.reduce(
          (acc, bookmark) => {
            acc[bookmark.id] = bookmark;
            return acc;
          },
          {} as Record<string, BookmarkWithoutData>,
        );
        // Preserve the state reference when a refresh returns the same bookmark collection.
        if (!isEqual(state.bookmarks, bookmarks)) {
          state.bookmarks = bookmarks;
        }
      })
      .addCase(bookmarkActions.setBookmark, (state, action) => {
        const bookmarkId = action.payload.id;
        // Preserve the state reference when the stored bookmark already has the same value.
        if (
          bookmarkId in state.bookmarks &&
          !isEqual(state.bookmarks[bookmarkId], action.payload)
        ) {
          state.bookmarks[bookmarkId] = action.payload;
        }
        // Keep the current bookmark in sync without emitting an equivalent state.
        if (
          state.currentBookmark?.id === bookmarkId &&
          !isEqual(state.currentBookmark, action.payload)
        ) {
          state.currentBookmark = action.payload;
        }
      })
      .addCase(bookmarkActions.setCurrentBookmark, (state, action) => {
        // Preserve the state reference when selecting an equivalent bookmark instance.
        if (!isEqual(state.currentBookmark, action.payload)) {
          state.currentBookmark = action.payload;
        }
      })
      .addCase(bookmarkActions.createBookmark.success, (state, action) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { payload, ...bookmark } = action.payload;
        // Preserve the state reference when a repeated response contains the same bookmark.
        if (!isEqual(state.bookmarks[bookmark.id], bookmark)) {
          state.bookmarks[bookmark.id] = bookmark;
        }
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

        // Update the stored bookmark only when the merged value changed.
        if (hasBookmark && !isEqual(state.bookmarks[bookmarkId], next)) {
          state.bookmarks[bookmarkId] = next;
        }

        // Update the selected bookmark only when the merged value changed.
        if (isCurrent && !isEqual(state.currentBookmark, next)) {
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
  });
};
