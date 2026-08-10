import { of } from 'rxjs';

import type { ConfigBuilderCallbackArgs } from '@equinor/fusion-framework-module';

import { BookmarkModuleConfigurator } from '../BookmarkModuleConfigurator';
import type { IBookmarkProvider } from '../BookmarkProvider.interface';
import type { Bookmark, BookmarkModuleConfig } from '../types';

import { BookmarkMockClient } from './BookmarkMockClient';

/**
 * Fallback application resolver used when the mock is configured standalone,
 * without a real `app` module registered.
 */
const mockApplicationResolver: BookmarkModuleConfig['resolve']['application'] = async () => ({
  appKey: 'mock-app',
});

/**
 * Fallback context resolver used when the mock is configured standalone,
 * without a real `context` module registered.
 */
const mockContextResolver: BookmarkModuleConfig['resolve']['context'] = async () => undefined;

/**
 * The real bookmark configurator, backed by an in-memory {@link BookmarkMockClient}.
 *
 * @remarks
 * Extends {@link BookmarkModuleConfigurator} directly, so the whole builder API
 * (source system, filters, resolvers, `setParent`) stays available. Only a
 * default client is added — through the same
 * {@link BookmarkModuleConfigurator.setClient | setClient} seam a caller would
 * use to plug in their own client — so an explicit `setClient()` call still
 * replaces it outright, exactly as it would on the real configurator.
 *
 * Seeded bookmarks and favorites flow through the real `BookmarkProvider` and
 * `bookmark-flows/` epics unmodified: create, update, delete, and favorite
 * calls all reach {@link BookmarkMockClient}, not a stand-in.
 *
 * @example Seed bookmarks and a current bookmark
 * ```typescript
 * enableBookmarkMock(configurator, (builder) => {
 *   builder.setBookmarks([myBookmark]);
 *   builder.setCurrentBookmark(myBookmark.id);
 *   builder.setFavorite(myBookmark.id, true);
 * });
 * ```
 *
 * @example Take full control of the client
 * ```typescript
 * enableBookmarkMock(configurator, (builder) => {
 *   builder.setClient(myOwnBookmarkClient);
 * });
 * ```
 */
export class BookmarkMockConfigurator extends BookmarkModuleConfigurator {
  #client = new BookmarkMockClient();
  #currentId?: string;

  /**
   * Seeds the bookmarks the mock client resolves through `getAllBookmarks`,
   * `getBookmarkById`, and `getBookmarkData`.
   *
   * @param items - The bookmarks to seed. Replaces any previously seeded bookmarks.
   * @returns `this`, for chaining.
   */
  public setBookmarks(items: Iterable<Bookmark>): this {
    this.#client.setBookmarks(items);
    return this;
  }

  /**
   * Declares which seeded bookmark `IBookmarkProvider.currentBookmark` reports
   * as active once the module initializes.
   *
   * @remarks
   * `BookmarkProvider` only reads its initial current bookmark from a parent
   * provider (see {@link BookmarkModuleConfigurator.setParent}), so this
   * registers a synthetic parent exposing the seeded bookmark — the same seam
   * a real nested-portal provider would use, just standing in for one.
   *
   * @param bookmarkId - The id of a bookmark previously passed to {@link setBookmarks},
   *   or `undefined` to leave the current bookmark unset.
   * @returns `this`, for chaining.
   */
  public setCurrentBookmark(bookmarkId: string | undefined): this {
    this.#currentId = bookmarkId;
    return this;
  }

  /**
   * Marks a seeded bookmark as a favorite, or clears it, reflected through
   * `IBookmarkClient.isBookmarkFavorite`.
   *
   * @param bookmarkId - The id of the bookmark to update.
   * @param isFavorite - `true` to favorite the bookmark, `false` to clear it. Defaults to `true`.
   * @returns `this`, for chaining.
   */
  public setFavorite(bookmarkId: string, isFavorite = true): this {
    this.#client.setFavorite(bookmarkId, isFavorite);
    return this;
  }

  /**
   * Installs the mock client and a synthetic current-bookmark parent before
   * building the configuration, unless the caller already declared their own.
   *
   * @remarks
   * Also falls back to trivial application/context resolvers when neither an
   * `app` nor a `context` module is registered alongside this mock — both are
   * required by {@link BookmarkModuleConfig}'s schema, but a standalone test
   * has no reason to pull in either module just to satisfy it. Registering a
   * real `app`/`context` module still wins, exactly as it does on the real
   * configurator.
   *
   * @param init - The config builder callback arguments.
   * @param initial - An optional initial config to merge into the returned config.
   * @returns The observable configuration, produced by the real configurator.
   */
  protected override _createConfig(
    init: ConfigBuilderCallbackArgs,
    initial?: Partial<BookmarkModuleConfig>,
  ) {
    // only stand in a mock client when the caller hasn't set their own
    if (!this._has('client')) {
      this.setClient(this.#client);
    }

    // only stand in a synthetic parent when a current bookmark was seeded and
    // the caller hasn't declared their own parent provider
    if (this.#currentId && !this._has('parent')) {
      const current = this.#client.getBookmark(this.#currentId) ?? null;
      const parent: Pick<IBookmarkProvider, 'currentBookmark' | 'currentBookmark$'> = {
        currentBookmark: current,
        currentBookmark$: of(current),
      };
      this.setParent(parent as IBookmarkProvider);
    }

    // no app module means the real default resolver would resolve to `undefined`,
    // which fails the required `resolve.application` schema field
    if (!this._has('resolve.application') && !init.hasModule('app')) {
      this.setApplicationResolver(async () => mockApplicationResolver);
    }

    // no context module means the real default resolver would resolve to `undefined`,
    // which fails the required `resolve.context` schema field
    if (!this._has('resolve.context') && !init.hasModule('context')) {
      this.setContextResolver(async () => mockContextResolver);
    }

    return super._createConfig(init, initial);
  }
}
