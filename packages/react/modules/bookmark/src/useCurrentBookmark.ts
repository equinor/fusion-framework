import { CreateBookMarkFn, CurrentBookmark } from './types';
import useModuleBookmark from './useModuleBookmark';

export const useCurrentBookmark = <TData>(
    createBookmarkState?: CreateBookMarkFn<TData>
): CurrentBookmark<TData> => {
    const { currentBookmark } = useModuleBookmark(createBookmarkState);
    return { currentBookmark };
};

export default useCurrentBookmark;
