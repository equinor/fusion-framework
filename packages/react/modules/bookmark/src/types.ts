import { Bookmark } from '@equinor/fusion-framework-module-bookmark';

export type CreateBookMarkFn<TData> = () => Partial<TData>;

export interface Bookmarks<TData> extends CurrentBookmark<TData> {
    /**
     * Function fo setting the current applications state creator, is used to collect the state stored in a bookmark.
     * This will enable the bookmark functionality for the application.
     *
     * @template T - Payload Type
     * @param {CreateBookmarkFn<T>} cb - For creating the bookmark payload, this should ne wrapped in a useCallback, payload return can be a partial.
     * @param {keyof T} [key] - User to that property to add partial payload to ,
     * @return {*}  {VoidFunction} - Return a cleanup function for removing the stateCreator.
     */
    addBookmarkCreator: (createBookmarkState?: CreateBookMarkFn<TData>) => VoidFunction;
    /**
     * Function for resoling all bookmarks current sub system.
     */
    getAllBookmarks: () => void;

    /**
     * Creates a new bookmark with the given arguments, and utilizes teh provided stateCreator to create the bookmark payload.
     * @param {{ name: string; description: string; isShared: boolean }} args - Name, Description and isSheared
     */
    createBookmark: (args: { name: string; description: string; isShared: boolean }) => void;

    /**
     * Function for updating bookmark a bookmark when successful this will update the bookmark list.
     * @param {string} bookmarkId
     * @param {Bookmark<unknown>} bookmark
     */
    updateBookmark: (bookmark: Bookmark<TData>) => void;
    /**
     * Function for deleting a bookmark, when successful this will update the bookmark list.
     * @param {string} bookmarkId
     */
    deleteBookmarkById: (bookmarkId: string) => void;
    /**
     * Function for setting the current bookmark, when successful this will update the bookmark list.
     * @template TData - Bookmark payload type.
     * @param {(string | Bookmark<TData> | undefined)} idOrItem - can be full bookmark object or bookmarkId.
     * If not provided the current bookmark state will be set to undefined.
     */
    setCurrentBookmark(IdOrItem: string | Bookmark<TData>): void;
    /**
     * List of bookmarks in the current configured system,
     * filtered by the confirmed SourceSystem identifier. This is done by the portal development team;
     * @type {Observable<Array<Bookmark<unknown>>>}
     */
    bookmarks: Bookmark<unknown>[];
}

export interface CurrentBookmark<TData> {
    currentBookmark?: Bookmark<TData>;
}
