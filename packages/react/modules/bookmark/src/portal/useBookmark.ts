import { Bookmark, IBookmarkProvider } from '@equinor/fusion-framework-module-bookmark';
import { useObservableState } from '@equinor/fusion-observable/react';
import { useCallback, useMemo } from 'react';
import { Bookmarks, CreateBookMarkFn } from '../types';

export const useBookmark = <TData>(bookmarkProvider: IBookmarkProvider): Bookmarks<TData> => {
    const currentBookmark = useObservableState(bookmarkProvider.currentBookmark$, {
        initial: bookmarkProvider.currentBookmark,
    }).next as Bookmark<TData>;

    //use Memo
    const bookmarks = useObservableState(
        useMemo(() => bookmarkProvider.bookmarks$, [bookmarkProvider]),
        {
            initial: [],
        }
    ).next;

    const addBookmarkCreator = useCallback(
        (createBookmarkState?: CreateBookMarkFn<TData>) => {
            if (!createBookmarkState)
                return () => {
                    // Noting to remove
                };
            return bookmarkProvider.addCreator(() => {
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
            bookmarkProvider.bookmarkClient.updateBookmark(bookmark);
        },
        [bookmarkProvider]
    );
    const deleteBookmarkById = useCallback(
        (bookmarkId: string) => {
            bookmarkProvider.bookmarkClient.deleteBookmarkById(bookmarkId);
        },
        [bookmarkProvider]
    );
    const getAllBookmarks = useCallback(() => {
        bookmarkProvider.bookmarkClient.getAllBookmarks();
    }, [bookmarkProvider]);

    const setCurrentBookmark = useCallback(
        <TData>(IdOrItem: string | Bookmark<TData>) => {
            bookmarkProvider.bookmarkClient.setCurrentBookmark(IdOrItem);
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
