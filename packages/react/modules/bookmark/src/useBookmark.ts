import { Bookmark, BookmarkModule } from '@equinor/fusion-framework-module-bookmark';
import { useFramework } from '@equinor/fusion-framework-react';
import { useObservableState } from '@equinor/fusion-observable/react';
import { useCallback, useMemo } from 'react';
import { Bookmarks, CreateBookMarkFn } from './types';

/**
 *  For application development the useCurrentBookmark should be sufficient enough
 *
 *  Functionality provided here is:
 *  - addBookmarkCreator
 *  - getAllBookmarks
 *  - createBookmark
 *  - updateBookmark
 *  - deleteBookmarkById
 *  - setCurrentBookmark
 *  - currentBookmark
 *  - bookmarks,
 *
 * @template TData - Current applications  bookmark type
 * @return {*}  {Bookmarks<TData>} the full api fro handling bookmarks
 */
export const useBookmark = <TData>(): Bookmarks<TData> => {
    const bookmarkProvider = useFramework<[BookmarkModule]>().modules.bookmark;

    const currentBookmark = useObservableState(
        useMemo(() => bookmarkProvider.currentBookmark$, [bookmarkProvider]),
        {
            initial: bookmarkProvider.currentBookmark,
        }
    ).value as Bookmark<TData>;

    const bookmarks = useObservableState(
        useMemo(() => bookmarkProvider.bookmarks$, [bookmarkProvider]),
        {
            initial: [],
        }
    ).value;

    const addBookmarkCreator = useCallback(
        (createBookmarkState?: CreateBookMarkFn<TData>) => {
            if (!createBookmarkState)
                return () => {
                    // Noting to remove
                };
            return bookmarkProvider.addStateCreator(() => {
                return createBookmarkState();
            });
        },
        [bookmarkProvider]
    );

    const createBookmark = useCallback(
        (args: { name: string; description: string; isShared: boolean }) => {
            bookmarkProvider.createBookmark(args);
        },
        [bookmarkProvider]
    );
    const updateBookmark = useCallback(
        (bookmark: Bookmark<TData>) => {
            bookmarkProvider.updateBookmark(bookmark);
        },
        [bookmarkProvider]
    );
    const deleteBookmarkById = useCallback(
        (bookmarkId: string) => {
            bookmarkProvider.deleteBookmarkById(bookmarkId);
        },
        [bookmarkProvider]
    );
    const getAllBookmarks = useCallback(() => {
        bookmarkProvider.getAllBookmarks();
    }, [bookmarkProvider]);

    const setCurrentBookmark = useCallback(
        <TData>(IdOrItem: string | Bookmark<TData>) => {
            bookmarkProvider.setCurrentBookmark(IdOrItem);
        },
        [bookmarkProvider]
    );

    return {
        addBookmarkCreator,
        getAllBookmarks,
        createBookmark,
        updateBookmark,
        deleteBookmarkById,
        setCurrentBookmark,
        currentBookmark,
        bookmarks,
    };
};

export default useBookmark;
