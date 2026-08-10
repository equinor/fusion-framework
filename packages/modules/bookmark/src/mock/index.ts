/**
 * Mock bookmark module for tests: real provider, real configurator, in-memory client.
 *
 * @remarks
 * Substituting `IBookmarkClient` is the smallest change that removes the
 * Fusion Core Services backend from a test. Everything above it — the
 * `BookmarkProvider` store, `bookmark-flows/` epics, payload generators, and
 * events — is the production code path.
 *
 * @example
 * ```typescript
 * import { enableBookmarkMock } from '@equinor/fusion-framework-module-bookmark/mock';
 *
 * enableBookmarkMock(configurator, (builder) => {
 *   builder.setBookmarks([myBookmark]);
 *   builder.setCurrentBookmark(myBookmark.id);
 *   builder.setFavorite(myBookmark.id, true);
 * });
 * ```
 *
 * @packageDocumentation
 */
export { BookmarkMockClient } from './BookmarkMockClient';
export { BookmarkMockConfigurator } from './BookmarkMockConfigurator';
export { enableBookmarkMock, bookmarkMockModule, type BookmarkMockConfigFn } from './module';
