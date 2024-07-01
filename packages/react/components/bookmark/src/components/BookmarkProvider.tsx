import { Snackbar } from '@equinor/eds-core-react';
import type { FrameworkEvent, FrameworkEventInit } from '@equinor/fusion-framework-module-event';
import { useFramework } from '@equinor/fusion-framework-react';
import { PropsWithChildren, createContext, useEffect, useState } from 'react';
import { CreateBookmarkModal } from './create-bookmark';
import { EditBookmarkModal } from './edit-bookmark';
import { ImportBookmarkModal } from './import-bookmark';
import { type BookmarkProvider as IBookmarkProvider } from '@equinor/fusion-framework-module-bookmark';

const bookmarkProviderContext = createContext<IBookmarkProvider | null>(null);

type BookmarkProviderProps = {
    readonly provider: IBookmarkProvider | null;
};

export const BookmarkProvider = (props: PropsWithChildren<BookmarkProviderProps>) => {
    const { provider, children } = props;
    return (
        <bookmarkProviderContext.Provider value={provider}>
            {children}
        </bookmarkProviderContext.Provider>
    );
};

export const BookmarkProviders = ({ children }: PropsWithChildren<unknown>) => {
    const [isCreateBookmarkOpen, setIsCreateBookmarkOpen] = useState(false);
    const [isEditBookmarkOpen, setIsEditBookmarkOpen] = useState(false);
    const [editBookmarkId, setEditBookmarkId] = useState<string | undefined>();
    const [isBookmarkCopy, setIsBookmarkCopy] = useState(false);

    const { event } = useFramework().modules;

    useEffect(() => {
        const subOnBookmarkOpen = event.addEventListener('onBookmarkOpen', (e) => {
            setIsCreateBookmarkOpen(e.detail);
        });

        const subOnBookmarkEdit = event.addEventListener('onBookmarkEdit', (e) => {
            setEditBookmarkId(e.detail.bookmarkId);
            setIsEditBookmarkOpen(true);
        });

        const subOnBookmarkUrlCopy = event.addEventListener('onBookmarkUrlCopy', () => {
            setIsBookmarkCopy(true);
        });

        return () => {
            subOnBookmarkEdit();
            subOnBookmarkOpen();
            subOnBookmarkUrlCopy();
        };
    }, [event]);

    return (
        <>
            <CreateBookmarkModal isOpen={isCreateBookmarkOpen} onClose={setIsCreateBookmarkOpen} />
            <EditBookmarkModal
                isOpen={isEditBookmarkOpen}
                onClose={setIsEditBookmarkOpen}
                bookmarkId={editBookmarkId}
            />
            <ImportBookmarkModal />
            <Snackbar
                autoHideDuration={2000}
                onClose={() => setIsBookmarkCopy(false)}
                open={isBookmarkCopy}
            >
                Bookmark url copied to clipboard
            </Snackbar>
            {children}
        </>
    );
};

declare module '@equinor/fusion-framework-module-event' {
    interface FrameworkEventMap {
        onBookmarkOpen: FrameworkEvent<FrameworkEventInit<boolean, unknown>>;
        onBookmarkEdit: FrameworkEvent<FrameworkEventInit<{ bookmarkId: string }, unknown>>;
        onBookmarkUrlCopy: FrameworkEvent<FrameworkEventInit<{ url: string }, unknown>>;
    }
}
