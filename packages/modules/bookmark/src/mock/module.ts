import type { AnyModule, IModulesConfigurator } from '@equinor/fusion-framework-module';

import { module, type BookmarkModule } from '../bookmark-module';

import { BookmarkMockConfigurator } from './BookmarkMockConfigurator';

/**
 * The bookmark module with a mock, in-memory client instead of a live
 * `@equinor/fusion-framework-module-services` connection.
 *
 * @remarks
 * Only `configure` differs from the real module. `initialize` is the
 * production one, untouched, so the real `BookmarkProvider` and
 * `bookmark-flows/` epics run exactly as they do in production — a test
 * observes the real create/update/delete/favorite flow, not a rehearsal of it.
 */
export const bookmarkMockModule: BookmarkModule = {
  ...module,
  configure: () => new BookmarkMockConfigurator(),
};

/**
 * Configuration callback for {@link enableBookmarkMock}.
 *
 * @template TRef - Reference type forwarded to the callback, inferred from the configurator.
 */
export type BookmarkMockConfigFn<TRef = unknown> = (
  configurator: BookmarkMockConfigurator,
  ref?: TRef,
) => void | Promise<void>;

/**
 * Enables the bookmark module against an in-memory mock client, so a test
 * needs no network and no real Fusion Core Services backend.
 *
 * @remarks
 * Registered last, this replaces whichever bookmark module the configurator
 * already carries, so it works on a `FrameworkConfigurator` that pre-registers
 * the real one.
 *
 * @param configurator - The modules configurator to register on.
 * @param configure - Optional callback to seed bookmarks, the current bookmark, or favorites.
 * @template TModules - The array of module descriptors managed by `configurator`.
 * @template TRef - Reference type forwarded to `configure`, inferred from `configurator`.
 *
 * @example
 * ```typescript
 * enableBookmarkMock(configurator, (builder) => {
 *   builder.setBookmarks([myBookmark]);
 *   builder.setCurrentBookmark(myBookmark.id);
 * });
 * ```
 */
export const enableBookmarkMock = <
  TModules extends Array<AnyModule> = Array<AnyModule>,
  TRef = unknown,
>(
  configurator: IModulesConfigurator<TModules, TRef>,
  configure?: BookmarkMockConfigFn<TRef>,
): void => {
  configurator.addConfig({ module: bookmarkMockModule, configure } as {
    module: BookmarkModule;
  });
};
