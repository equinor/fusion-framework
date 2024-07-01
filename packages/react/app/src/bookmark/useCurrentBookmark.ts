import {
    CreateBookmarkFn,
    useCurrentBookmark as _useCurrentBookmark,
} from '@equinor/fusion-framework-react-module-bookmark';

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
export const useCurrentBookmark = <TData>(createBookmarkState?: CreateBookmarkFn<TData>) =>
    _useCurrentBookmark(createBookmarkState);

export default useCurrentBookmark;
