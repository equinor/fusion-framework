import { describe, expect, it, vi } from 'vitest';

import { mockFramework } from '@equinor/fusion-framework/mock';
import { enableAppManifestMock } from '@equinor/fusion-framework-app/mock';
import type { AppMockConfigureFn } from '@equinor/fusion-framework-app/mock';
import type { AppModule } from '@equinor/fusion-framework-module-app';
import { enableBookmarkMock } from '@equinor/fusion-framework-module-bookmark/mock';
import type { Bookmark, BookmarkModule } from '@equinor/fusion-framework-module-bookmark';

import { useCurrentBookmark } from '../bookmark/useCurrentBookmark';
import { renderAppHook } from '@equinor/fusion-framework-vitest-plugin-react-app/test';
import { useAppModules } from '../useAppModules';

const env = {
  manifest: {
    appKey: 'test-app',
    displayName: 'Test App',
    description: 'A test application',
    type: 'standalone' as const,
  },
};

/** A fully-formed seeded bookmark, so tests only override what they care about. */
const createBookmark = (overrides: Partial<Bookmark> = {}): Bookmark => ({
  id: 'bookmark-1',
  name: 'My Bookmark',
  appKey: 'test-app',
  created: new Date('2024-01-01T00:00:00.000Z'),
  createdBy: { id: 'seed-user', name: 'Seed User' },
  ...overrides,
});

describe('useCurrentBookmark', () => {
  it('returns the app-scoped current bookmark once it belongs to the active app', async () => {
    const bookmark = createBookmark();
    const fusion = await mockFramework<[AppModule]>((configurator) =>
      enableAppManifestMock(configurator, env),
    );
    fusion.modules.app.setCurrentApp(env.manifest.appKey);

    const configure: AppMockConfigureFn<[BookmarkModule]> = (configurator) =>
      enableBookmarkMock(configurator, (builder) => {
        builder.setBookmarks([bookmark]);
        builder.setCurrentBookmark(bookmark.id);
      });

    const { result } = await renderAppHook(() => useCurrentBookmark(), { env, fusion, configure });

    await vi.waitFor(() =>
      expect(result.current.currentBookmark).toMatchObject({ id: bookmark.id }),
    );
  });

  it('hides the current bookmark once it belongs to a different app', async () => {
    const bookmark = createBookmark({ appKey: 'some-other-app' });
    const fusion = await mockFramework<[AppModule]>((configurator) =>
      enableAppManifestMock(configurator, env),
    );
    fusion.modules.app.setCurrentApp(env.manifest.appKey);

    const configure: AppMockConfigureFn<[BookmarkModule]> = (configurator) =>
      enableBookmarkMock(configurator, (builder) => {
        builder.setBookmarks([bookmark]);
        builder.setCurrentBookmark(bookmark.id);
      });

    const { result } = await renderAppHook(
      () => ({
        bookmark: useCurrentBookmark(),
        // unfiltered provider state, so we can tell the seeded bookmark actually
        // resolved rather than the filter trivially matching a still-pending value
        provider: useAppModules<[BookmarkModule]>().bookmark,
      }),
      { env, fusion, configure },
    );

    await vi.waitFor(() =>
      expect(result.current.provider.currentBookmark).toMatchObject({ id: bookmark.id }),
    );
    expect(result.current.bookmark.currentBookmark).toBeNull();
  });

  it('falls back to the framework-scoped bookmark provider, warning about the deprecation', async () => {
    const bookmark = createBookmark();
    const fusion = await mockFramework<[AppModule, BookmarkModule]>((configurator) => {
      enableAppManifestMock(configurator, env);
      enableBookmarkMock(configurator, (builder) => {
        builder.setBookmarks([bookmark]);
        builder.setCurrentBookmark(bookmark.id);
      });
    });
    fusion.modules.app.setCurrentApp(env.manifest.appKey);

    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const { result } = await renderAppHook(() => useCurrentBookmark(), { env, fusion });

    await vi.waitFor(() =>
      expect(result.current.currentBookmark).toMatchObject({ id: bookmark.id }),
    );
    expect(warnSpy).toHaveBeenCalledWith(
      '@deprecation',
      expect.stringContaining('has not enabled bookmarks'),
    );

    warnSpy.mockRestore();
  });
});
