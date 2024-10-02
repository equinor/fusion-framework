import { FlowSubject, type ActionBaseType } from '@equinor/fusion-observable';

import { type BookmarkActions } from './BookmarkProvider.actions';
import { type BookmarkFlowError } from './BookmarkProvider.error';
import { createBookmarkReducer } from './BookmarkProvider.reducer';
import { bookmarkApiFlows } from './BookmarkProvider.flows';
import type { IBookmarkClient } from './BookmarkClient.interface';
import type { Bookmark, BookmarkWithoutData } from './types';

/**
 * Represents the state of the BookmarkProvider store.
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
 * Represents the store for bookmarks, which is a flow subject that manages the state and actions for bookmarks.
 */
export type BookmarkStore = FlowSubject<BookmarkState, BookmarkActions>;

/**
 * Creates a new BookmarkStore instance with the provided initial state and client.
 *
 * @param args - An object containing the initial state and client for the bookmark store.
 * @param args.initial - The initial state for the bookmark store.
 * @param args.client - The IBookmarkClient instance to bookmark store flows.
 * @returns A new BookmarkStore instance.
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
