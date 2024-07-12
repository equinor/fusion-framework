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

/**
 * Represents the store for bookmarks, which is a flow subject that manages the state and actions for bookmarks.
 */
export type BookmarkStore = FlowSubject<BookmarkState, BookmarkActions> & {
    execute: ActionCalls<typeof bookmarkActions>;
    client: IBookmarkClient;
};

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
    const { client, initial } = args;
    // create the store
    const subject = new FlowSubject(createBookmarkReducer(initial));

    // add flows to the store
    subject.addFlow(bookmarkApiFlows(args.client));

    // add action calls to the store
    const store = Object.assign(subject, {
        client,
        execute: actionMapper(bookmarkActions, subject),
    });
    return store;
};
