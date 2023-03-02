import { Bookmark } from '@equinor/fusion-framework-module-bookmark';

export type CreateBookMarkFn<TData> = () => Partial<TData>;

export interface Bookmarks<TData> extends CurrentBookmark<TData> {
    addBookmarkCreator: (createBookmarkState?: CreateBookMarkFn<TData> | undefined) => VoidFunction;
    getAllBookmarks: () => void;
    createBookmark: (args: { name: string; description: string; isShared: boolean }) => void;
    updateBookmark: (bookmark: Bookmark<TData>) => void;
    deleteBookmarkById: (bookmarkId: string) => void;
    setCurrentBookmark(IdOrItem: string | Bookmark<TData>): void;
    bookmarks: Bookmark<unknown>[];
}

export interface CurrentBookmark<TData> {
    currentBookmark: Bookmark<TData> | undefined;
}
