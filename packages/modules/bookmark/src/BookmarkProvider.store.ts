import { FlowSubject, type ActionBaseType } from '@equinor/fusion-observable';

import type { BookmarkActions } from './BookmarkProvider.actions';
import type { BookmarkFlowError } from './BookmarkProvider.error';
import { createBookmarkReducer } from './BookmarkProvider.reducer';
import { bookmarkApiFlows } from './BookmarkProvider.flows';
import type { IBookmarkClient } from './BookmarkClient.interface';
import type { Bookmark, BookmarkWithoutData } from './types';

/**
 * Internal state shape managed by the bookmark store.
 *
 * @property status - Set of base action types currently in-flight (used for loading indicators).
 * @property errors - Map from base action type to the most recent error for that action.
 * @property currentBookmark - The active bookmark, `null` when explicitly cleared, `undefined` before first set.
 * @property bookmarks - Normalised record of bookmarks keyed by ID.
 */
export type BookmarkState = {
  // current actions performed on the store
  status: Set<ActionBaseType<BookmarkActions>>;
  // errors that have occurred during the bookmark flow
  errors: Record<ActionBaseType<BookmarkActions>, BookmarkFlowError>;
  // the currently active bookmark, if any
  currentBookmark?: Bookmark | null;
  // the collection of bookmarks, keyed by their IDs
  bookmarks: Record<string, BookmarkWithoutData>;
};

// export type BookmarkStoreFunctions = ActionCalls<typeof bookmarkActions>;

/**
 * A {@link FlowSubject} specialised for bookmark state and actions.
 *
 * Combines a Redux-style reducer with RxJS side-effect flows to manage
 * bookmark CRUD operations, favourites, and current-bookmark selection.
 */
export type BookmarkStore = FlowSubject<BookmarkState, BookmarkActions>;

/**
 * Creates and returns a new {@link BookmarkStore} wired with the bookmark
 * reducer and all API side-effect flows.
 *
 * @param args - Initialisation options.
 * @param args.initial - Optional partial state merged over the reducer defaults.
 * @param args.client - The {@link IBookmarkClient} used by store flows for API calls.
 * @returns A fully configured bookmark store.
 */
export const createBookmarkStore = (args: {
  initial?: Partial<BookmarkState>;
  client: IBookmarkClient;
}): BookmarkStore => {
  // create the store
  const store = new FlowSubject<BookmarkState, BookmarkActions>(
    createBookmarkReducer(args.initial),
  );

  // add the bookmark API flows to the store
  store.addFlow(bookmarkApiFlows(args.client));

  return store;
};
