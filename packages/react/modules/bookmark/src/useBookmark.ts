import {
    Bookmark,
    PatchBookmark,
    BookmarkModule,
    UpdateBookmarkOptions,
} from '@equinor/fusion-framework-module-bookmark';
import { useFramework } from '@equinor/fusion-framework-react';
import { useObservableState } from '@equinor/fusion-observable/react';
import { useCallback, useMemo } from 'react';
import { Bookmarks, CreateBookMarkFn } from './types';

import { EMPTY } from 'rxjs';

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
        useMemo(() => bookmarkProvider?.currentBookmark$ ?? EMPTY, [bookmarkProvider]),
        {
            initial: bookmarkProvider.currentBookmark,
        }
    ).value as Bookmark<TData> | null | undefined;

    const bookmarks = useObservableState(
        useMemo(() => bookmarkProvider?.bookmarks$ ?? EMPTY, [bookmarkProvider]),
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
        async <T>(args: {
            name: string;
            description: string;
            isShared: boolean;
        }): Promise<Bookmark<T>> => {
            return await bookmarkProvider.createBookmark<T>(args);
        },
        [bookmarkProvider]
    );
    const updateBookmark = useCallback(
        async <T>(
            bookmark: PatchBookmark<T>,
            options?: UpdateBookmarkOptions
        ): Promise<Bookmark<T> | undefined> => {
            return await bookmarkProvider.updateBookmarkAsync<T>(bookmark, options);
        },
        [bookmarkProvider]
    );
    const deleteBookmarkById = useCallback(
        async (bookmarkId: string): Promise<string> => {
            return await bookmarkProvider.deleteBookmarkByIdAsync(bookmarkId);
        },
        [bookmarkProvider]
    );
    const getAllBookmarks = useCallback(async (): Promise<Array<Bookmark>> => {
        return await bookmarkProvider.getAllBookmarksAsync();
    }, [bookmarkProvider]);

    const addBookmarkFavorite = useCallback(
        async (bookmarkId: string): Promise<void> => {
            return await bookmarkProvider.addBookmarkFavoriteAsync(bookmarkId);
        },
        [bookmarkProvider]
    );
    const removeBookmarkFavorite = useCallback(
        async (bookmarkId: string): Promise<void> => {
            return await bookmarkProvider.removeBookmarkFavoriteAsync(bookmarkId);
        },
        [bookmarkProvider]
    );

    const setCurrentBookmark = useCallback(
        <TData>(IdOrItem: string | Bookmark<TData>): void => {
            bookmarkProvider.setCurrentBookmark(IdOrItem);
        },
        [bookmarkProvider]
    );

    const getBookmarkById = useCallback(
        <TData>(id: string): Promise<Bookmark<TData>> =>
            bookmarkProvider.getBookmarkById<TData>(id),
        [bookmarkProvider]
    );

    const getCurrentAppKey = useCallback(() => {
        return (
            bookmarkProvider.config.getCurrentAppIdentification &&
            bookmarkProvider.config.getCurrentAppIdentification()
        );
    }, [bookmarkProvider]);

    return {
        addBookmarkCreator,
        getAllBookmarks,
        createBookmark,
        updateBookmark,
        deleteBookmarkById,
        setCurrentBookmark,
        getBookmarkById,
        currentBookmark,
        bookmarks,
        getCurrentAppKey,
        addBookmarkFavorite,
        removeBookmarkFavorite,
    };
};

export default useBookmark;
