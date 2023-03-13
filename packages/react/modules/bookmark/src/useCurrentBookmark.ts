import { useLayoutEffect } from 'react';
import useBookmark from './useBookmark';
import { CreateBookMarkFn, CurrentBookmark } from './types';

/**
 * By providing a CreateBookMarkFn bookmarks is enabled for the current application.
 *
 * @template TData - Type of data stored in bookmark
 * @param {CreateBookMarkFn<TData>} [createBookmarkState] - Function for creating bookmark payload, this function should be wrapped in useCallback
 *
 * ```TS
 * // Example
 * const { currentBookmark } = useCurrentBookmark(useCallback(()=> someState, [someState]))
 * ```
 * @return {*}  {CurrentBookmark<TData>}
 */
export const useCurrentBookmark = <TData>(
    createBookmarkState?: CreateBookMarkFn<TData>
): CurrentBookmark<TData> => {
    const { currentBookmark, addBookmarkCreator } = useBookmark<TData>();

    useLayoutEffect(() => {
        if (createBookmarkState) {
            return addBookmarkCreator(createBookmarkState);
        }
    }, [addBookmarkCreator, createBookmarkState]);

    return { currentBookmark };
};

export default useCurrentBookmark;
