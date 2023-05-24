import {
    Bookmark,
    PatchBookmark,
    UpdateBookmarkOptions,
} from '@equinor/fusion-framework-module-bookmark';

export type CreateBookMarkFn<TData> = () => Partial<TData>;

export interface Bookmarks<TData> extends CurrentBookmark<TData> {
    /**
     * Function fo setting the current applications state creator, is used to collect the state stored in a bookmark.
     * This will enable the bookmark functionality for the application.
     *
     * @template TData - Bookmark Payload Type
     * @param {CreateBookmarkFn<TData>} cb - For creating the bookmark payload, this should ne wrapped in a useCallback, payload return can be a partial.
     * @param {keyof TData} [key] - User to that property to add partial payload to ,
     * @return {*}  {VoidFunction} - Return a cleanup function for removing the stateCreator.
     */
    addBookmarkCreator: (createBookmarkState?: CreateBookMarkFn<TData>) => VoidFunction;
    /**
     * Function for resoling all bookmarks current sub system.
     * @return {Promise<Array<Bookmark>>} - A list of bookmarks with no payload. Payload needs to be resolved
     * with set current bookmark
     */
    getAllBookmarks: () => Promise<Array<Bookmark>>;

    /**
     * Creates a new bookmark with the given arguments, utilizing the provided stateCreator to create the bookmark payload.
     * @param {{ name: string; description: string; isShared: boolean }} args - Name, Description and isSheared
     * @returns {Promise<Bookmark<T>>} an instance of the created bookmark.
     */
    createBookmark: <T>(args: {
        name: string;
        description: string;
        isShared: boolean;
    }) => Promise<Bookmark<T>>;

    /**
     * Function for updating bookmark a bookmark when successful this will update the bookmark list.
     * @template T - Bookmark Payload Type
     * @param {string} bookmarkId
     * @param {Bookmark<T>} bookmark
     * @param {UpdateBookmarkOptions} options - alow for configuration of bookmark payload update.
     * @returns {Promise<Bookmark<T>>} the updated bookmark item.
     */
    updateBookmark: <T>(
        bookmark: PatchBookmark<T>,
        options?: UpdateBookmarkOptions
    ) => Promise<Bookmark<T> | undefined>;
    /**
     * Function for deleting a bookmark, when successful this will update the bookmark list.
     * @param {string} bookmarkId
     * @returns {Promise<string>} the bookmarkId ot the deleted bookmark
     */
    deleteBookmarkById: (bookmarkId: string) => Promise<string>;
    /**
     * Function for setting the current bookmark, when successful this will update the bookmark list.
     * @template TData - Bookmark payload type set on class level
     * @param {(string | Bookmark<TData> | undefined)} idOrItem - can be full bookmark object or bookmarkId.
     * If not provided the current bookmark state will be set to undefined.
     */
    setCurrentBookmark(IdOrItem: string | Bookmark<TData>): void;
    /**
     * Function for resolving a bookmark bookmark.
     * @template TData - Bookmark payload type set on class level
     * @param {(string} id - bookmarkId.
     */
    getBookmarkById<T>(IdOrItem: string | Bookmark<T>): Promise<Bookmark<T>>;
    /**
     * List of bookmarks in the current configured system,
     * filtered by the confirmed SourceSystem identifier. This is done by the portal development team;
     * @type {Observable<Array<Bookmark<unknown>>>}
     */
    bookmarks: Bookmark<unknown>[];
    /**
     * Util function for resolving current app key for bookmark use.
     */
    getCurrentAppKey: () => string | undefined;

    //add description
    removeBookmarkFavorite: (bookmarkId: string) => Promise<void>;
    addBookmarkFavorite: (bookmarkId: string) => Promise<void>;
}

export interface CurrentBookmark<TData> {
    currentBookmark?: Bookmark<TData> | null;
}
