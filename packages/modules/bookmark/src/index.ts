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
export { BookmarkModuleConfigurator } from './BookmarkConfigurator';

export type {
  IBookmarkClient,
  BookmarkNew,
  BookmarkUpdate,
  BookmarksFilter,
} from './BookmarkClient.interface';

export {
  default,
  BookmarkModule,
  module as bookmarkModule,
  moduleKey as bookmarkModuleKey,
} from './bookmark-module';

export { BookmarkProvider } from './BookmarkProvider';

export type {
  BookmarkCreateArgs,
  BookmarkUpdateOptions,
  IBookmarkProvider,
  BookmarkPayloadGenerator,
} from './BookmarkProvider.interface';

export type { BookmarkProviderEventMap as BookmarkProviderEvents } from './BookmarkProvider.events.js';

export { enableBookmark } from './enable-bookmark';

export * from './types';

export { bookmarkWithDataSchema } from './bookmark.schemas';
