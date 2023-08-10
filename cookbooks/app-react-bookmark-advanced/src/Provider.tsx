import { useCurrentBookmark } from '@equinor/fusion-framework-react-module-bookmark';

import { useBookmark } from '@equinor/fusion-framework-react-app/bookmark';

import {
    createContext,
    FC,
    PropsWithChildren,
    useCallback,
    useContext,
    useEffect,
    useState,
} from 'react';

import { BookmarkState } from './types';

export const init = {
    name: '',
    description: '',
    isShared: false,
    payload: {
        page: ' ',
        title: '',
        data: '',
    },
};

interface BookmarkContext extends BookmarkState {
    updateState(cb: (state: BookmarkState) => Partial<BookmarkState>): void;
}

const Context = createContext<BookmarkContext | null>(null);

export const Provider: FC<PropsWithChildren<unknown>> = ({ children }) => {
    const [state, setState] = useState<BookmarkState>(init);

    const { getAllBookmarks } = useBookmark();

    const { currentBookmark } = useCurrentBookmark(
        useCallback(() => state.payload, [state.payload]),
    );

    const updateState = useCallback((cb: (state: BookmarkState) => Partial<BookmarkState>) => {
        setState((s) => ({ ...s, ...cb(s) }));
    }, []);

    useEffect(() => {
        currentBookmark && setState(currentBookmark as BookmarkState);
    }, [currentBookmark]);

    useEffect(() => {
        getAllBookmarks();
    }, []);

    return <Context.Provider value={{ ...state, updateState }}>{children}</Context.Provider>;
};

export const useBookmarkContext = () => {
    const context = useContext(Context);

    if (!context) {
        throw new Error('BookmarkContext context used out of bounds');
    }
    return context;
};
