import { useCallback, useLayoutEffect, useMemo } from 'react';
import { useModule } from '@equinor/fusion-framework-react-module';
import {
    BookmarkData,
    BookmarkModule,
    BookmarkProvider,
    BookmarkPayloadGenerator,
    Bookmark,
} from '@equinor/fusion-framework-module-bookmark';
import { useObservableState } from '@equinor/fusion-observable/src/react';

export interface useCurrentBookmark<TData extends BookmarkData> {
    (createBookmarkState?: BookmarkPayloadGenerator<TData>): Bookmark<TData>;
    (options: {
        createBookmarkState: BookmarkPayloadGenerator<TData>;
        provider?: BookmarkProvider;
    }): Bookmark<TData>;
}

/**
 * By providing a CreateBookMarkFn bookmarks is enabled for the current application.
 *
 * @template TData - Type of data stored in bookmark
 * @param {CreateBookmarkFn<TData>} [createBookmarkState] - Function for creating bookmark payload, this function should be wrapped in useCallback
 *
 * ```TS
 * // Example
 * const { currentBookmark } = useCurrentBookmark(useCallback(()=> someState, [someState]))
 * ```
 * @return {*}  {CurrentBookmark<TData>}
 */
export const useCurrentBookmark = <TData extends BookmarkData>(
    args?:
        | BookmarkPayloadGenerator<TData>
        | {
              payloadGenerator: BookmarkPayloadGenerator<TData>;
              provider?: BookmarkProvider;
          },
): {
    currentBookmark: Bookmark<TData> | null;
    setCurrentBookmark: (bookmark: Bookmark) => void;
} => {
    const baseProvider = useModule<BookmarkModule>('bookmark');

    const { payloadGenerator, provider = baseProvider } =
        typeof args === 'function' ? { payloadGenerator: args } : args ?? {};

    const { value: bookmark } = useObservableState(
        useMemo(() => provider?.currentBookmark$, [provider]),
        {
            initial: provider?.currentBookmark,
        },
    );

    const setCurrentBookmark = useCallback(
        (bookmark: Bookmark) => {
            provider.setCurrentBookmark(bookmark);
        },
        [provider],
    );

    useLayoutEffect(() => {
        if (payloadGenerator) {
            provider.addPayloadGenerator(payloadGenerator);
        }
    }, [provider, payloadGenerator]);

    return { currentBookmark: bookmark as Bookmark<TData> | null, setCurrentBookmark };
};

export default useCurrentBookmark;
