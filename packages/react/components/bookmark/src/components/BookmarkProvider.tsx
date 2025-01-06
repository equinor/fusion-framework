import { Snackbar } from '@equinor/eds-core-react';
import type { FrameworkEvent, FrameworkEventInit } from '@equinor/fusion-framework-module-event';
import { type PropsWithChildren, createContext, useCallback, useContext, useState } from 'react';
import { CreateBookmarkModal } from './create-bookmark';
import { EditBookmarkModal } from './edit-bookmark';
import { ImportBookmarkModal } from './import-bookmark';
import { type IBookmarkProvider } from '@equinor/fusion-framework-module-bookmark';

type BookmarkApp = {
    appKey: string;
    name?: string;
};

type ProviderState = {
    provider: IBookmarkProvider;
    currentApp?: BookmarkApp | null;
    showCreateBookmark: () => void;
    showEditBookmark: (bookmarkId: string) => void;
    addBookmarkToClipboard: (bookmarkId: string) => void;
};

const bookmarkProviderContext = createContext<ProviderState | null>(null);

type BookmarkProviderProps = {
    readonly provider?: IBookmarkProvider | null;
    readonly currentApp?: BookmarkApp | null;
};

export const useBookmarkComponentContext = () =>
    useContext(bookmarkProviderContext) as ProviderState;

export const BookmarkProvider = (props: PropsWithChildren<BookmarkProviderProps>) => {
    const { provider, currentApp, children } = props;

    const [isCreateBookmarkOpen, setIsCreateBookmarkOpen] = useState(false);
    const [editBookmarkId, setEditBookmarkId] = useState<string | undefined>();

    const showCreateBookmark = useCallback(() => {
        setIsCreateBookmarkOpen(true);
    }, []);

    const [snackbarContent, setSnackbarContent] = useState('');

    const addBookmarkToClipboard = useCallback((bookmarkId: string) => {
        const url = new URL(window.location.toString());
        url.searchParams.set('bookmarkId', bookmarkId);
        navigator.clipboard.writeText(String(url));
        setSnackbarContent('Bookmark url copied to clipboard');
    }, []);

    if (!provider) {
        return null;
    }

    return (
        <bookmarkProviderContext.Provider
            value={{
                provider,
                currentApp,
                showCreateBookmark,
                showEditBookmark: setEditBookmarkId,
                addBookmarkToClipboard,
            }}
        >
            <CreateBookmarkModal isOpen={isCreateBookmarkOpen} onClose={setIsCreateBookmarkOpen} />
            {editBookmarkId && (
                <EditBookmarkModal
                    isOpen={!!editBookmarkId}
                    onClose={() => setEditBookmarkId(undefined)}
                    bookmarkId={editBookmarkId}
                />
            )}
            <ImportBookmarkModal />
            <Snackbar
                autoHideDuration={2000}
                onClose={() => setSnackbarContent('')}
                open={!!snackbarContent}
            >
                {snackbarContent}
            </Snackbar>
            {children}
        </bookmarkProviderContext.Provider>
    );
};

declare module '@equinor/fusion-framework-module-event' {
    interface FrameworkEventMap {
        // onBookmarkOpen: FrameworkEvent<FrameworkEventInit<boolean, unknown>>;
        onBookmarkEdit: FrameworkEvent<FrameworkEventInit<{ bookmarkId: string }, unknown>>;
        onBookmarkUrlCopy: FrameworkEvent<FrameworkEventInit<{ url: string }, unknown>>;
    }
}
