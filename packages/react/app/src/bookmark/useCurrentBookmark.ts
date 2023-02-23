import {
    CreateBookMarkFn,
    useCurrentBookmark as _useCurrentBookmark,
} from '@equinor/fusion-framework-react-module-bookmark';

export const useCurrentBookmark = <TData>(createBookmarkState?: CreateBookMarkFn<TData>) =>
    _useCurrentBookmark(createBookmarkState);

export default useCurrentBookmark;
