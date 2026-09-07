import { describe, expect, it } from 'vitest';

import { bookmarkActions } from '../bookmark-actions';
import { createBookmarkReducer } from '../create-bookmark-reducer';
import type { BookmarkState } from '../create-bookmark-store';
import type { Bookmark, BookmarkWithoutData } from '../types';

const bookmark: Bookmark = {
  id: 'bookmark-id',
  name: 'Bookmark',
  appKey: 'app-key',
  created: new Date('2026-09-07T00:00:00.000Z'),
  createdBy: { id: 'user-id', name: 'User' },
  context: { id: 'context-id', name: 'Context' },
  payload: { nested: { value: true } },
};

const bookmarkWithoutData: BookmarkWithoutData = {
  id: bookmark.id,
  name: bookmark.name,
  appKey: bookmark.appKey,
  created: bookmark.created,
  createdBy: bookmark.createdBy,
  context: bookmark.context,
};

/** Creates bookmark state for reducer identity assertions. */
const createState = (): BookmarkState => ({
  ...createBookmarkReducer().getInitialState(),
  currentBookmark: bookmark,
  bookmarks: { [bookmark.id]: bookmarkWithoutData },
});

describe('createBookmarkReducer', () => {
  it('preserves state when setting a deeply equal current bookmark', () => {
    const reducer = createBookmarkReducer();
    const state = createState();
    const equivalentBookmark = structuredClone(bookmark);

    const nextState = reducer(state, bookmarkActions.setCurrentBookmark(equivalentBookmark));

    expect(nextState).toBe(state);
  });

  it('preserves state when fetching a deeply equal bookmark collection', () => {
    const reducer = createBookmarkReducer();
    const state = createState();
    const equivalentBookmark = structuredClone(bookmarkWithoutData);

    const nextState = reducer(state, bookmarkActions.fetchBookmarks.success([equivalentBookmark]));

    expect(nextState).toBe(state);
  });

  it('updates state when a nested bookmark value changes', () => {
    const reducer = createBookmarkReducer();
    const state = createState();
    const changedBookmark = structuredClone(bookmark);
    changedBookmark.payload = { nested: { value: false } };

    const nextState = reducer(state, bookmarkActions.setCurrentBookmark(changedBookmark));

    expect(nextState).not.toBe(state);
    expect(nextState.currentBookmark).toEqual(changedBookmark);
  });
});
