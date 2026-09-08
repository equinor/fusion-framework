import { firstValueFrom, from, map, type ObservableInput } from 'rxjs';
import { describe, expect, it } from 'vitest';

import { BookmarkProvider } from '../BookmarkProvider';
import type { BookmarkUpdate } from '../BookmarkClient.interface';
import { BookmarkMockClient } from '../mock';
import type { Bookmark, BookmarkData } from '../types';

/** Simulates an update endpoint that returns bookmark metadata without echoing its payload. */
class PayloadOmittingBookmarkClient extends BookmarkMockClient {
  /** @inheritdoc */
  public override updateBookmark<T extends BookmarkData>(
    bookmarkId: string,
    updates: BookmarkUpdate<T>,
  ): ObservableInput<Bookmark<T>> {
    return from(super.updateBookmark(bookmarkId, updates)).pipe(
      map(({ payload: _payload, ...bookmark }) => bookmark),
    );
  }
}

describe('BookmarkProvider filters', () => {
  it('exposes an immutable snapshot of the configured filters', () => {
    const filters = { context: true, application: true };
    const provider = new BookmarkProvider({
      client: new BookmarkMockClient(),
      filters,
      resolve: {
        context: async () => undefined,
        application: async () => undefined,
      },
    });

    filters.context = false;

    expect(provider.filters).toEqual({ context: true, application: true });
    expect(Object.isFrozen(provider.filters)).toBe(true);
    expect(Reflect.set(provider.filters ?? {}, 'application', false)).toBe(false);
    expect(provider.filters?.application).toBe(true);

    provider.dispose();
  });

  it('preserves an omitted filters configuration', () => {
    const provider = new BookmarkProvider({
      client: new BookmarkMockClient(),
      resolve: {
        context: async () => undefined,
        application: async () => undefined,
      },
    });

    expect(provider.filters).toBeUndefined();

    provider.dispose();
  });
});

describe('BookmarkProvider updates', () => {
  it('publishes the submitted payload when updating the current bookmark', async () => {
    const bookmark: Bookmark<{ view: string }> = {
      id: 'bookmark-1',
      name: 'Bookmark',
      appKey: 'test-app',
      created: new Date('2026-01-01T00:00:00.000Z'),
      createdBy: { id: 'user-1', name: 'Test User' },
      payload: { view: 'old' },
    };
    const client = new PayloadOmittingBookmarkClient();
    client.setBookmarks([bookmark]);
    const provider = new BookmarkProvider({
      client,
      resolve: {
        context: async () => undefined,
        application: async () => undefined,
      },
    });
    await firstValueFrom(provider.setCurrentBookmark(bookmark));
    const observed: Array<Bookmark | null | undefined> = [];
    const subscription = provider.currentBookmark$.subscribe((current) => observed.push(current));

    const updated = await firstValueFrom(
      provider.updateBookmark(
        bookmark.id,
        { payload: { view: 'new' } },
        { excludePayloadGeneration: true },
      ),
    );

    expect(updated.payload).toEqual({ view: 'new' });
    expect(provider.currentBookmark?.payload).toEqual({ view: 'new' });
    expect(observed.at(-1)?.payload).toEqual({ view: 'new' });

    subscription.unsubscribe();
    provider.dispose();
  });

  it('does not attach another bookmark payload to the current bookmark', async () => {
    const current: Bookmark<{ view: string }> = {
      id: 'bookmark-1',
      name: 'Current bookmark',
      appKey: 'test-app',
      created: new Date('2026-01-01T00:00:00.000Z'),
      createdBy: { id: 'user-1', name: 'Test User' },
      payload: { view: 'current' },
    };
    const updated: Bookmark<{ view: string }> = {
      ...current,
      id: 'bookmark-2',
      name: 'Updated bookmark',
      payload: { view: 'old' },
    };
    const client = new PayloadOmittingBookmarkClient();
    client.setBookmarks([current, updated]);
    const provider = new BookmarkProvider({
      client,
      resolve: {
        context: async () => undefined,
        application: async () => undefined,
      },
    });
    await firstValueFrom(provider.getAllBookmarks());
    await firstValueFrom(provider.setCurrentBookmark(current));

    const result = await firstValueFrom(
      provider.updateBookmark(
        updated.id,
        { payload: { view: 'new' } },
        { excludePayloadGeneration: true },
      ),
    );

    expect(result.payload).toBeUndefined();
    expect(provider.currentBookmark).toEqual(current);

    provider.dispose();
  });
});
