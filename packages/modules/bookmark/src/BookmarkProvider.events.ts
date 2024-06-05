import type { FrameworkEventInit, IFrameworkEvent } from '@equinor/fusion-framework-module-event';
import type { Bookmark, BookmarkData, NewBookmark, PatchBookmark } from './types';
import type { BookmarkProvider } from './BookmarkProvider';

export interface BookmarkProviderEventMap {
    /**
     * An event that is emitted before current bookmark is changed.
     * @event onCurrentBookmarkChange
     * @param {FrameworkEventInit<{ current?: BookmarkData | null; next: BookmarkData | null }, BookmarkProvider>} event - The event payload, containing the current and next bookmark data.
     */
    onCurrentBookmarkChange: IFrameworkEvent<
        FrameworkEventInit<
            { current?: BookmarkData | null; next: BookmarkData | null },
            BookmarkProvider
        >
    >;

    /**
     * An event that is emitted when the current bookmark has changed.
     * @event onCurrentBookmarkChange
     * @param {FrameworkEventInit<BookmarkData | null, BookmarkProvider>} event - The event payload, containing the new bookmark data.
     */
    onCurrentBookmarkChanged: IFrameworkEvent<
        FrameworkEventInit<BookmarkData | null, BookmarkProvider>
    >;

    /**
     * An event that is emitted before a bookmark is created.
     * @event onBookmarkCreate
     * @param {FrameworkEventInit<NewBookmark, BookmarkProvider>} event - The event payload, containing the new bookmark data.
     */
    onBookmarkCreate: IFrameworkEvent<FrameworkEventInit<NewBookmark, BookmarkProvider>>;

    /**
     * An event that is emitted when a bookmark has been created.
     * @event onBookmarkCreated
     * @param {FrameworkEventInit<Bookmark, BookmarkProvider>} event - The event payload, containing the newly created bookmark data.
     */
    onBookmarkCreated: IFrameworkEvent<FrameworkEventInit<Bookmark, BookmarkProvider>>;

    /**
     * An event that is emitted before a bookmark is updated.
     * @event onBookmarkUpdated
     * @param {FrameworkEventInit<PatchBookmark, BookmarkProvider>} event - The event payload, containing the updated bookmark data.
     */
    onBookmarkUpdate: IFrameworkEvent<FrameworkEventInit<PatchBookmark, BookmarkProvider>>;

    /**
     * An event that is emitted before a bookmark is updated.
     * @event onBookmarkUpdate
     * @param {FrameworkEventInit<PatchBookmark, BookmarkProvider>} event - The event payload, containing the updated bookmark data.
     */
    onBookmarkUpdated: IFrameworkEvent<FrameworkEventInit<Bookmark, BookmarkProvider>>;

    /**
     * An event that is emitted before a bookmark is removed.
     * @event onBookmarkRemoved
     * @param {FrameworkEventInit<{ type: string; bookmarkId: string }, BookmarkProvider>} event - The event payload, containing the type of removal (e.g. 'delete') and the ID of the removed bookmark.
     */
    onBookmarkRemove: IFrameworkEvent<FrameworkEventInit<string, BookmarkProvider>>;

    /**
     * An event that is emitted before a bookmark is removed.
     * @event onBookmarkRemoved
     * @param {FrameworkEventInit<{ type: string; bookmarkId: string }, BookmarkProvider>} event - The event payload, containing the type of removal (e.g. 'delete') and the ID of the removed bookmark.
     */
    onBookmarkRemoved: IFrameworkEvent<
        FrameworkEventInit<{ type: string; bookmarkId: string }, BookmarkProvider>
    >;

    /**
     * An event that is emitted before a bookmark is added to the user's favorites.
     * @event onBookmarkFavouriteAdd
     * @param {FrameworkEventInit<{ bookmarkId: string }, BookmarkProvider>} event - The event payload, containing the ID of the bookmark that was added to the user's favorites.
     */
    onBookmarkFavouriteAdd: IFrameworkEvent<
        FrameworkEventInit<{ bookmarkId: string }, BookmarkProvider>
    >;

    /**
     * An event that is emitted when a bookmark is added to the user's favorites.
     * @event onBookmarkFavouriteAdded
     * @param {FrameworkEventInit<{ bookmark: Bookmark | null }, BookmarkProvider>} event - The event payload, containing the bookmark that was added to the user's favorites.
     */
    onBookmarkFavouriteAdded: IFrameworkEvent<
        FrameworkEventInit<{ bookmark: Bookmark | null }, BookmarkProvider>
    >;
}

declare module '@equinor/fusion-framework-module-event' {
    interface FrameworkEventMap extends BookmarkProviderEventMap {}
}
