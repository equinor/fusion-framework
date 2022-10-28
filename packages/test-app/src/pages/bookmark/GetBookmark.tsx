import { useAppModule } from '@equinor/fusion-framework-react-app';
import { BookmarkModule } from '@equinor/fusion-framework-module-bookmark';
import { useEffect, useState } from 'react';

import { useObservableState } from '@equinor/fusion-observable/react';

const useCurrentBookmark = () => {
    const provider = useAppModule<BookmarkModule>('bookmark');

    console.log(provider);
    return useObservableState(provider.bookmarkClient.currentBookmark$);
};

export const GetBookmarkModule = () => {
    const provider = useAppModule<BookmarkModule>('bookmark');
    const eventHub = useAppModule('event');

    const [event, setEvent] = useState<unknown>(null);

    const [bookmarkId, setBookmarkId] = useState<string>('0c3cb077-fbd5-41e0-a6e7-db4d10dfd2f3');
    const bookmark = useCurrentBookmark();

    const status = useObservableState(provider.bookmarkClient.status$);

    useEffect(() => {
        if (!bookmarkId) {
            return;
        }
        provider.bookmarkClient.setCurrentBookmark(bookmarkId);
    }, [provider, bookmarkId]);

    useEffect(() => {
        eventHub.addEventListener('onCurrentContextChange', (e) => setEvent(e.detail));
    }, [eventHub]);

    return (
        <div>
            <select onChange={(e) => setBookmarkId(e.currentTarget.value)}>
                <option value="0c3cb077-fbd5-41e0-a6e7-db4d10dfd2f3">
                    Oseberg Gas Capacity Upgrade (OGP)
                </option>
                <option value="2c49b999-2feb-49dc-bb13-42a651cd92bc">Johan Castberg</option>
                <option value="a007e04a-e372-4da5-b5be-8d2f6b671065">Krafla</option>
                <option value="03f56966-4732-48bc-8b42-6450cedb38fa">Fusion</option>
            </select>
            <div>
                <span>Status:</span>
                <span>{status}</span>
            </div>

            <pre>
                <code>{JSON.stringify(bookmark, undefined, 4)}</code>
            </pre>

            <div style={{ border: 1, padding: 20, background: 'cornflowerblue' }}>
                <span>onCurrentContextChange:</span>
                <pre>
                    <code>{JSON.stringify(event, undefined, 4)}</code>
                </pre>
            </div>
        </div>
    );
};

export default GetBookmarkModule;
