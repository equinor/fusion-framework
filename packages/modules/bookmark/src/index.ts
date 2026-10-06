/**
 * Bookmark module for the Fusion Framework.
 *
 * Provides bookmark management (create, update, delete, favourite) with
 * application-scoped payloads and event-driven state updates.
 *
 * @see {@link enableBookmark} to enable the module in a configurator.
 * @see {@link BookmarkProvider} for the runtime provider API.
 *
 * @packageDocumentation
 */
export { BookmarkModuleConfigurator } from './BookmarkModuleConfigurator.js';

export type {
  IBookmarkClient,
  BookmarkNew,
  BookmarkUpdate,
  BookmarksFilter,
} from './BookmarkClient.interface.js';

export {
  default,
  BookmarkModule,
  module as bookmarkModule,
  moduleKey as bookmarkModuleKey,
} from './bookmark-module.js';

export { BookmarkProvider } from './BookmarkProvider.js';

export type {
  BookmarkCreateArgs,
  BookmarkUpdateOptions,
  IBookmarkProvider,
  BookmarkPayloadGenerator,
} from './BookmarkProvider.interface.js';

export type { BookmarkProviderEventMap as BookmarkProviderEvents } from './BookmarkProvider.events.js';

export { enableBookmark } from './enable-bookmark.js';

export * from './types.js';

export { bookmarkWithDataSchema } from './bookmark.schemas.js';
