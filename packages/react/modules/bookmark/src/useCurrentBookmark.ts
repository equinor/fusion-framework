import { useLayoutEffect, useMemo } from 'react';
import {
    BookmarkData,
    BookmarkProvider,
    BookmarkPayloadGenerator,
    Bookmark,
} from '@equinor/fusion-framework-module-bookmark';
import { useObservableState } from '@equinor/fusion-observable/react';
import { useBookmarkProvider } from './useBookmarkProvider';
import { EMPTY } from 'rxjs';

export type useCurrentBookmarkOptions<TData extends BookmarkData> = {
    payloadGenerator?: BookmarkPayloadGenerator<TData>;
    provider?: BookmarkProvider;
};

export type useCurrentBookmarkReturn<TData extends BookmarkData> = {
    currentBookmark: Bookmark<TData> | null;
    setCurrentBookmark: BookmarkProvider['setCurrentBookmarkAsync'];
};

/**
 * By providing a CreateBookMarkFn bookmarks is enabled for the current application.
 *
 * @template TData - Type of data stored in bookmark
 * @param {CreateBookmarkFn<TData>} [createBookmarkState] - Function for creating bookmark payload, this function should be wrapped in useCallback
 * @return {*}  {CurrentBookmark<TData>}
 */
export const useCurrentBookmark = <TData extends BookmarkData>(
    args?: BookmarkPayloadGenerator<TData> | useCurrentBookmarkOptions<TData>,
): useCurrentBookmarkReturn<TData> => {
    const baseProvider = useBookmarkProvider();

    const { payloadGenerator, provider = baseProvider } =
        typeof args === 'function' ? { payloadGenerator: args } : (args ?? {});

    const { value: bookmark } = useObservableState(
        useMemo(() => provider?.currentBookmark$ ?? EMPTY, [provider]),
        {
            initial: provider?.currentBookmark,
        },
    );

    const setCurrentBookmark = useMemo(() => {
        if (!provider) {
            throw new Error('No bookmark provider found');
        }
        return provider.setCurrentBookmarkAsync.bind(provider);
    }, [provider]);

    useLayoutEffect(() => {
        if (provider && payloadGenerator) {
            return provider.addPayloadGenerator(payloadGenerator);
        }
    }, [provider, payloadGenerator]);

    return { currentBookmark: bookmark as Bookmark<TData> | null, setCurrentBookmark };
};

export default useCurrentBookmark;
