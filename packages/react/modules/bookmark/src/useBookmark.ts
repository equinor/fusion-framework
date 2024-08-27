import { useCallback, useLayoutEffect, useMemo } from 'react';

import { EMPTY } from 'rxjs';

import {
    Bookmark,
    Bookmarks,
    BookmarkUpdate,
    BookmarkData,
    BookmarkPayloadGenerator,
    BookmarkUpdateOptions,
    BookmarkProvider,
} from '@equinor/fusion-framework-module-bookmark';

import { useObservableState } from '@equinor/fusion-observable/react';

import { useBookmarkProvider } from './useBookmarkProvider';
import { BookmarkCreateArgs } from '@equinor/fusion-framework-module-bookmark/src/BookmarkProvider';

export type useBookmarkArgs = {
    provider?: BookmarkProvider;
    payloadGenerator?: BookmarkPayloadGenerator<BookmarkData>;
};

export type useBookmarkResult = {
    currentBookmark: Bookmark | null;
    setCurrentBookmark: (bookmark: Bookmark | string | null) => void;
    bookmarks: Bookmarks;
    getAllBookmarks: () => Promise<Bookmarks>;
    getBookmarkById: (bookmarkId: string) => Promise<Bookmark | null | undefined>;
    createBookmark: <T extends BookmarkData>(args: BookmarkCreateArgs<T>) => Promise<Bookmark<T>>;
    updateBookmark: <T extends BookmarkData>(
        value: BookmarkUpdate<T> & { id: string },
        options?: BookmarkUpdateOptions,
    ) => Promise<Bookmark<T> | undefined>;
    deleteBookmarkById: (bookmarkId: string) => Promise<void>;
    addBookmarkFavorite: (bookmarkId: string) => Promise<void>;
    removeBookmarkFavorite: (bookmarkId: string) => Promise<void>;
    addBookmarkCreator: (cb: BookmarkPayloadGenerator) => VoidFunction | undefined;
};

/**
 * @deprecated
 * For application development the useCurrentBookmark should be sufficient enough
 */
export const useBookmark = (args?: useBookmarkArgs): useBookmarkResult => {
    const defaultProvider = useBookmarkProvider();
    const bookmarkProvider = args?.provider ?? defaultProvider;
    const payloadGenerator = args?.payloadGenerator;

    const { value: currentBookmark } = useObservableState(
        useMemo(() => bookmarkProvider?.currentBookmark$ ?? EMPTY, [bookmarkProvider]),
        {
            initial: bookmarkProvider?.currentBookmark,
        },
    );

    const { value: bookmarks } = useObservableState(
        useMemo(() => bookmarkProvider?.bookmarks$ ?? EMPTY, [bookmarkProvider]),
        {
            initial: bookmarkProvider?.bookmarks ?? [],
        },
    );

    useLayoutEffect(() => {
        if (payloadGenerator) {
            return bookmarkProvider?.addPayloadGenerator(payloadGenerator);
        }
    }, [payloadGenerator, bookmarkProvider]);

    /**
     * @deprecated use `payloadGenerator` instead {@link useBookmarkArgs.payloadGenerator}
     */
    const addBookmarkCreator = useCallback(
        (cb: BookmarkPayloadGenerator) => {
            if (bookmarkProvider) {
                return bookmarkProvider.addPayloadGenerator(cb);
            }
            throw Error('No BookmarkProvider found');
        },
        [bookmarkProvider],
    );

    /**
     * @deprecated use provider instead {@link BookmarkProvider.createBookmarkAsync}
     */
    const createBookmark = useCallback(
        <T extends BookmarkData>(args: BookmarkCreateArgs<T>): Promise<Bookmark<T>> => {
            if (bookmarkProvider) {
                return bookmarkProvider.createBookmarkAsync(args);
            }
            throw Error('No BookmarkProvider found');
        },
        [bookmarkProvider],
    );

    /**
     * @deprecated use provider instead {@link BookmarkProvider.updateBookmarkAsync}
     */
    const updateBookmark = useCallback(
        async <T extends BookmarkData>(
            bookmark: BookmarkUpdate<T> & { id: string },
            options?: BookmarkUpdateOptions,
        ): Promise<Bookmark<T> | undefined> => {
            if (bookmarkProvider) {
                const { id, ...updates } = bookmark;
                return await bookmarkProvider.updateBookmarkAsync(id, updates, options);
            }
            return undefined;
        },
        [bookmarkProvider],
    );

    /**
     * @deprecated use provider instead {@link BookmarkProvider.removeBookmarkAsync}
     */
    const deleteBookmarkById = useCallback(
        async (bookmarkId: string): Promise<void> => {
            bookmarkProvider && (await bookmarkProvider.deleteBookmarkAsync(bookmarkId));
        },
        [bookmarkProvider],
    );

    /**
     * @deprecated use provider instead {@link BookmarkProvider.getAllBookmarks}
     */
    const getAllBookmarks = useCallback(async (): Promise<Bookmarks> => {
        return bookmarkProvider ? await bookmarkProvider.getAllBookmarksAsync() : [];
    }, [bookmarkProvider]);

    /**
     * @deprecated use provider instead {@link BookmarkProvider.addBookmarkToFavoritesAsync}
     */
    const addBookmarkFavorite = useCallback(
        async (bookmarkId: string): Promise<void> => {
            bookmarkProvider && (await bookmarkProvider.addBookmarkToFavoritesAsync(bookmarkId));
        },
        [bookmarkProvider],
    );

    /**
     * @deprecated use provider instead {@link BookmarkProvider.removeBookmarkAsync}
     */
    const removeBookmarkFavorite = useCallback(
        async (bookmarkId: string): Promise<void> => {
            bookmarkProvider && (await bookmarkProvider.removeBookmarkAsFavoriteAsync(bookmarkId));
        },
        [bookmarkProvider],
    );

    const setCurrentBookmark = useCallback(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (IdOrItem: Bookmark | string | null): void => {
            bookmarkProvider && bookmarkProvider.setCurrentBookmark(IdOrItem);
        },
        [bookmarkProvider],
    );

    /** @deprecated */
    const getBookmarkById = useCallback(
        <TData extends BookmarkData>(id: string): Promise<Bookmark<TData> | undefined | null> => {
            return bookmarkProvider
                ? bookmarkProvider.getBookmarkAsync<TData>(id)
                : Promise.resolve(undefined);
        },
        [bookmarkProvider],
    );

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
        // getCurrentAppKey,
        addBookmarkFavorite,
        removeBookmarkFavorite,
    };
};

export default useBookmark;
