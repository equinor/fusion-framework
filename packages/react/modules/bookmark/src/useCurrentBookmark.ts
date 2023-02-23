import { CreateBookMarkFn, CurrentBookmark } from './types';
import useModuleBookmark from './useModuleBookmark';

export const useCurrentBookmark = <TData>(
    createBookmarkState?: CreateBookMarkFn<TData>
): CurrentBookmark<TData> => {
    const { currentBookmark, hasBookmark } = useModuleBookmark(createBookmarkState);
    return { currentBookmark, hasBookmark };
};

export default useCurrentBookmark;
