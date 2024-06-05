import {
    FlowSubject,
    actionMapper,
    type ActionBaseType,
    type ActionCalls,
} from '@equinor/fusion-observable';
import { bookmarkActions, type BookmarkActions } from './BookmarkProvider.actions';
import { type BookmarkFlowError } from './BookmarkProvider.error';
import { createBookmarkReducer } from './BookmarkProvider.reducer';
import { bookmarkApiFlows } from './BookmarkProvider.flows';
import type { IBookmarkClient } from './BookmarkClient.interface';
import type { BookmarkData, Bookmark } from './types';

/**
 * Represents the state of the BookmarkProvider store.
 */
export type BookmarkState = {
    // current actions performed on the store
    status: Set<ActionBaseType<BookmarkActions>>;
    // errors that have occurred during the bookmark flow
    errors: Record<ActionBaseType<BookmarkActions>, BookmarkFlowError>;
    // the currently active bookmark, if any
    activeBookmark?: BookmarkData | null;
    // the collection of bookmarks, keyed by their IDs
    bookmarks: Record<string, Bookmark>;
};

/**
 * Represents the store for bookmarks, which is a flow subject that manages the state and actions for bookmarks.
 */
export type BookmarkStore = FlowSubject<BookmarkState, BookmarkActions> &
    ActionCalls<typeof bookmarkActions>;

/**
 * Creates a new BookmarkStore instance with the provided initial state and client.
 *
 * @param args - An object containing the initial state and client for the bookmark store.
 * @param args.initial - The initial state for the bookmark store.
 * @param args.client - The IBookmarkClient instance to bookmark store flows.
 * @returns A new BookmarkStore instance.
 */
export const createBookmarkStore = (args: {
    initial?: BookmarkState;
    client: IBookmarkClient;
}): BookmarkStore => {
    // create the store
    const subject = new FlowSubject(createBookmarkReducer(args.initial));

    // add flows to the store
    subject.addFlow(bookmarkApiFlows(args.client));

    // add action calls to the store
    const store = Object.assign(subject, actionMapper(bookmarkActions, subject));
    return store;
};
