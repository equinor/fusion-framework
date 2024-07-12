import type { FrameworkEventInit, IFrameworkEvent } from '@equinor/fusion-framework-module-event';
import type { Bookmark } from './types';
import type { BookmarkPayloadGenerator, BookmarkProvider } from './BookmarkProvider';
import { BookmarkNew, BookmarkUpdate } from './BookmarkClient.interface';

export interface BookmarkProviderEventMap {
    /**
     * An event that is emitted before current bookmark is changed.
     */
    onCurrentBookmarkChange: IFrameworkEvent<
        FrameworkEventInit<{ current?: Bookmark | null; next: Bookmark | null }, BookmarkProvider>
    >;

    /**
     * An event that is emitted when the current bookmark has changed.
     */
    onCurrentBookmarkChanged: IFrameworkEvent<
        FrameworkEventInit<Bookmark | null, BookmarkProvider>
    >;

    /**
     * An event that is emitted before a bookmark is created.
     */
    onBookmarkCreate: IFrameworkEvent<FrameworkEventInit<BookmarkNew, BookmarkProvider>>;

    /**
     * An event that is emitted when a bookmark has been created.
     */
    onBookmarkCreated: IFrameworkEvent<FrameworkEventInit<Bookmark, BookmarkProvider>>;

    /**
     * An event that is emitted before a bookmark is updated.
     */
    onBookmarkUpdate: IFrameworkEvent<
        FrameworkEventInit<{ current?: Bookmark; updates: BookmarkUpdate }, BookmarkProvider>
    >;

    /**
     * An event that is emitted before a bookmark is updated.
     */
    onBookmarkUpdated: IFrameworkEvent<FrameworkEventInit<Bookmark, BookmarkProvider>>;

    /**
     * An event that is emitted before a bookmark is removed.
     */
    onBookmarkDelete: IFrameworkEvent<FrameworkEventInit<{ id: string }, BookmarkProvider>>;

    /**
     * An event that is emitted before a bookmark is removed.
     */
    onBookmarkDeleted: IFrameworkEvent<FrameworkEventInit<{ id: string }, BookmarkProvider>>;

    /**
     * An event that is emitted before a bookmark is added to the user's favorites.
     */
    onBookmarkFavouriteRemove: IFrameworkEvent<
        FrameworkEventInit<{ id: string }, BookmarkProvider>
    >;

    /**
     * An event that is emitted when a bookmark is removed from the user's favorites.
     */
    onBookmarkFavouriteRemoved: IFrameworkEvent<
        FrameworkEventInit<{ id: string }, BookmarkProvider>
    >;

    /**
     * An event that is emitted before a bookmark is added to the user's favorites.
     */
    onBookmarkFavouriteAdd: IFrameworkEvent<FrameworkEventInit<{ id: string }, BookmarkProvider>>;

    /**
     * An event that is emitted when a bookmark is added to the user's favorites.
     */
    onBookmarkFavouriteAdded: IFrameworkEvent<
        FrameworkEventInit<Bookmark | undefined, BookmarkProvider>
    >;

    /**
     * An event that is emitted when a new bookmark payload generator is added.
     */
    onBookmarkPayloadCreatorAdded: IFrameworkEvent<
        FrameworkEventInit<BookmarkPayloadGenerator, BookmarkProvider>
    >;
}

declare module '@equinor/fusion-framework-module-event' {
    interface FrameworkEventMap extends BookmarkProviderEventMap {}
}
