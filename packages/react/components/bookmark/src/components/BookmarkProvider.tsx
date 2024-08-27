import { Snackbar } from '@equinor/eds-core-react';
import type { FrameworkEvent, FrameworkEventInit } from '@equinor/fusion-framework-module-event';
import { useFramework } from '@equinor/fusion-framework-react';
import { PropsWithChildren, createContext, useContext, useEffect, useMemo, useState } from 'react';
import { CreateBookmarkModal } from './create-bookmark';
import { EditBookmarkModal } from './edit-bookmark';
import { ImportBookmarkModal } from './import-bookmark';
import {
    BookmarkModule,
    type BookmarkProvider as IBookmarkProvider,
} from '@equinor/fusion-framework-module-bookmark';
import { Observable, of } from 'rxjs';
import { useObservableState } from '@equinor/fusion-observable/react';

type BookmarkApp = {
    appKey: string;
    name?: string;
};

type ProviderState = {
    provider: IBookmarkProvider;
    currentApp?: BookmarkApp | null;
};

const bookmarkProviderContext = createContext<ProviderState | null>(null);

type BookmarkProviderProps = {
    readonly provider?: IBookmarkProvider | null;
};

export const useBookmarkComponentContext = () =>
    useContext(bookmarkProviderContext) as ProviderState;

export const useBookmarkProvider = () => useBookmarkComponentContext().provider;

export const BookmarkProvider = (props: PropsWithChildren<BookmarkProviderProps>) => {
    const { event: eventProvider } = useFramework<[BookmarkModule]>().modules;

    const { provider, children } = props;

    const [isCreateBookmarkOpen, setIsCreateBookmarkOpen] = useState(false);
    const [isEditBookmarkOpen, setIsEditBookmarkOpen] = useState(false);
    const [editBookmarkId, setEditBookmarkId] = useState<string | undefined>();
    const [isBookmarkCopy, setIsBookmarkCopy] = useState(false);

    // get the current app
    const { value: currentApp } = useObservableState(
        useMemo(() => {
            // if no provider, return null, this should not happen
            if (!provider) {
                return of(null);
            }
            return new Observable<BookmarkApp | null>((observer) => {
                // resolve the application
                const resolveApp = async () => {
                    // get the resolved application
                    const app = await provider.resolvedApplication();
                    // emit the resolved application
                    observer.next(app);
                };
                // re-resolve the application when the current app changes
                eventProvider.addEventListener('onCurrentAppChanged', resolveApp);

                // initial resolve
                resolveApp();
            });
        }, [eventProvider, provider]),
        { initial: undefined },
    );

    useEffect(() => {
        const subOnBookmarkOpen = eventProvider.addEventListener('onBookmarkOpen', (e) => {
            setIsCreateBookmarkOpen(e.detail);
        });

        const subOnBookmarkEdit = eventProvider.addEventListener('onBookmarkEdit', (e) => {
            setEditBookmarkId(e.detail.bookmarkId);
            setIsEditBookmarkOpen(true);
        });

        const subOnBookmarkUrlCopy = eventProvider.addEventListener('onBookmarkUrlCopy', () => {
            setIsBookmarkCopy(true);
        });

        return () => {
            subOnBookmarkEdit();
            subOnBookmarkOpen();
            subOnBookmarkUrlCopy();
        };
    }, [eventProvider]);

    if (!provider) {
        return null;
    }

    return (
        <bookmarkProviderContext.Provider value={{ provider, currentApp }}>
            <CreateBookmarkModal isOpen={isCreateBookmarkOpen} onClose={setIsCreateBookmarkOpen} />
            {editBookmarkId && (
                <EditBookmarkModal
                    isOpen={isEditBookmarkOpen}
                    onClose={setIsEditBookmarkOpen}
                    bookmarkId={editBookmarkId}
                />
            )}
            <ImportBookmarkModal />
            <Snackbar
                autoHideDuration={2000}
                onClose={() => setIsBookmarkCopy(false)}
                open={isBookmarkCopy}
            >
                Bookmark url copied to clipboard
            </Snackbar>
            {children}
        </bookmarkProviderContext.Provider>
    );
};

declare module '@equinor/fusion-framework-module-event' {
    interface FrameworkEventMap {
        onBookmarkOpen: FrameworkEvent<FrameworkEventInit<boolean, unknown>>;
        onBookmarkEdit: FrameworkEvent<FrameworkEventInit<{ bookmarkId: string }, unknown>>;
        onBookmarkUrlCopy: FrameworkEvent<FrameworkEventInit<{ url: string }, unknown>>;
    }
}
