import { firstValueFrom, from, type ObservableInput } from 'rxjs';
import { describe, expect, it } from 'vitest';

import { ModulesConfigurator } from '@equinor/fusion-framework-module';

import { BookmarkModuleConfigurator } from '../../BookmarkModuleConfigurator';
import { BookmarkProvider } from '../../BookmarkProvider';
import type { IBookmarkProvider } from '../../BookmarkProvider.interface';
import { module as realModule } from '../../bookmark-module';
import type { Bookmark } from '../../types';

import {
  BookmarkMockClient,
  BookmarkMockConfigurator,
  bookmarkMockModule,
  enableBookmarkMock,
} from '../../mock';

/** A fully-formed seeded bookmark, so tests only override what they care about. */
const createBookmark = (overrides: Partial<Bookmark> = {}): Bookmark => ({
  id: 'bookmark-1',
  name: 'My Bookmark',
  appKey: 'test-app',
  created: new Date('2024-01-01T00:00:00.000Z'),
  createdBy: { id: 'seed-user', name: 'Seed User' },
  ...overrides,
});

/**
 * Initializes the mock module through the real module system.
 *
 * @remarks
 * Deliberately avoids hand-building initialization arguments — faking the
 * module system is the very cost this mock removes.
 *
 * @param configure - Optional callback to seed bookmarks, current bookmark, or favorites.
 * @returns The `IBookmarkProvider` the module produced.
 */
const initializeMockWith = async (
  configure?: (builder: BookmarkMockConfigurator) => void,
): Promise<IBookmarkProvider> => {
  const configurator = new ModulesConfigurator([]);
  enableBookmarkMock(configurator, configure);
  const instances = await configurator.initialize();
  return (instances as unknown as { bookmark: IBookmarkProvider }).bookmark;
};

/**
 * Resolves the first value of an `IBookmarkProvider` call.
 *
 * @remarks
 * `IBookmarkProvider`'s methods are typed as `ObservableInput`, not `Observable`,
 * so this wraps with `from()` before handing off to `firstValueFrom`.
 *
 * @template T - The value the observable input emits.
 * @param input - The observable input to resolve.
 * @returns A promise resolving to the first emitted value.
 */
const firstValue = <T>(input: ObservableInput<T>): Promise<T> => firstValueFrom(from(input));

describe('bookmarkMockModule', () => {
  it('changes nothing but the configurator', () => {
    expect(bookmarkMockModule.name).toBe(realModule.name);
    expect(bookmarkMockModule.version).toBe(realModule.version);
    // The production initializer, untouched — the mock has no lifecycle of its own
    expect(bookmarkMockModule.initialize).toBe(realModule.initialize);
  });

  it('builds a real BookmarkModuleConfigurator, so the whole builder stays available', () => {
    const configurator = bookmarkMockModule.configure?.();

    expect(configurator).toBeInstanceOf(BookmarkModuleConfigurator);
    expect(configurator).toBeInstanceOf(BookmarkMockConfigurator);
  });
});

describe('enableBookmarkMock', () => {
  it('produces the real BookmarkProvider, not a stand-in', async () => {
    const provider = await initializeMockWith();

    expect(provider).toBeInstanceOf(BookmarkProvider);
  });

  it('replaces a bookmark module that is already registered', async () => {
    // A FrameworkConfigurator pre-registers the real bookmark module, so the
    // mock is only useful if registering it afterwards wins
    const configurator = new ModulesConfigurator([realModule]);
    enableBookmarkMock(configurator, (builder) => {
      builder.setBookmarks([createBookmark()]);
    });

    const instances = await configurator.initialize();
    const provider = (instances as unknown as { bookmark: IBookmarkProvider }).bookmark;

    const bookmarks = await firstValue(provider.getAllBookmarks());
    expect(bookmarks).toHaveLength(1);
  });

  it('reflects seeded bookmarks with no real HTTP', async () => {
    const seeded = createBookmark();
    const provider = await initializeMockWith((builder) => {
      builder.setBookmarks([seeded]);
    });

    const bookmarks = await firstValue(provider.getAllBookmarks());
    expect(bookmarks.map((b) => b.id)).toEqual([seeded.id]);
  });

  it('reflects the seeded current bookmark', async () => {
    const seeded = createBookmark();
    const provider = await initializeMockWith((builder) => {
      builder.setBookmarks([seeded]);
      builder.setCurrentBookmark(seeded.id);
    });

    expect(provider.currentBookmark?.id).toBe(seeded.id);
  });

  it('leaves the current bookmark unset when none is seeded', async () => {
    const provider = await initializeMockWith((builder) => {
      builder.setBookmarks([createBookmark()]);
    });

    expect(provider.currentBookmark).toBeNull();
  });

  it('reflects a seeded favorite', async () => {
    const seeded = createBookmark();
    const provider = await initializeMockWith((builder) => {
      builder.setBookmarks([seeded]);
      builder.setFavorite(seeded.id, true);
    });

    await expect(firstValue(provider.isBookmarkInFavorites(seeded.id))).resolves.toBe(true);
  });

  it('creates a bookmark through the real create flow', async () => {
    const provider = await initializeMockWith();
    // without a payload generator, generatePayload() never emits and the create
    // flow would hang forever waiting on it
    provider.addPayloadGenerator(() => {});

    const created = await firstValue(
      provider.createBookmark({ name: 'New Bookmark', appKey: 'test-app' }),
    );

    expect(created.name).toBe('New Bookmark');
    const bookmarks = await firstValue(provider.getAllBookmarks());
    expect(bookmarks.map((b) => b.id)).toContain(created.id);
  });

  it('updates a bookmark through the real update flow', async () => {
    const seeded = createBookmark();
    const provider = await initializeMockWith((builder) => {
      builder.setBookmarks([seeded]);
    });
    // the update reducer only applies to bookmarks already tracked in the store,
    // so fetch once first to seed it
    await firstValue(provider.getAllBookmarks());

    const updated = await firstValue(
      provider.updateBookmark(seeded.id, { name: 'Renamed' }, { excludePayloadGeneration: true }),
    );

    expect(updated.name).toBe('Renamed');
  });

  it('surfaces a missing bookmark as an observable error through the real fetch flow', async () => {
    const provider = await initializeMockWith();

    await expect(firstValue(provider.getBookmark('missing-bookmark'))).rejects.toThrow();
  });

  it('deletes a bookmark through the real delete flow', async () => {
    const seeded = createBookmark();
    const provider = await initializeMockWith((builder) => {
      builder.setBookmarks([seeded]);
    });

    await firstValue(provider.deleteBookmark(seeded.id));

    const bookmarks = await firstValue(provider.getAllBookmarks());
    expect(bookmarks.map((b) => b.id)).not.toContain(seeded.id);
  });

  it('lets setClient() replace the mock client outright', async () => {
    const ownClient = new BookmarkMockClient();
    ownClient.setBookmarks([createBookmark({ id: 'own-bookmark' })]);

    const provider = await initializeMockWith((builder) => {
      // the escape hatch is inherited unchanged from BookmarkModuleConfigurator
      builder.setBookmarks([createBookmark({ id: 'ignored-bookmark' })]);
      builder.setClient(ownClient);
    });

    const bookmarks = await firstValue(provider.getAllBookmarks());
    expect(bookmarks.map((b) => b.id)).toEqual(['own-bookmark']);
  });
});
