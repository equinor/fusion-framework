import { useEffect, useState } from 'react';

import {
    ApiVersions,
    GetBookmarkResult,
} from '@equinor/fusion-framework-module-services/bookmarks/get/index';

import { useBookmarksClient } from './useBookmarksClient';

const useGetBookmark = <TVersion extends ApiVersions, TPayload>(id: string, version: TVersion) => {
    const [bookmark, setBookmark] = useState<GetBookmarkResult<TVersion, TPayload> | null>(null);

    const client = useBookmarksClient<'json$', TPayload>('json$');

    useEffect(() => {
        if (client && id.trim().length === 36) {
            const subscription = client.get(version, { id }).subscribe((val) => setBookmark(val));
            return () => subscription.unsubscribe();
        }
    }, [client, version, id]);

    return bookmark;
};

export const GetBookmark = () => {
    const [id, setId] = useState('86c4e16a-0005-44c4-a545-72fb7c48b348');
    const bookmark = useGetBookmark<'v1', { id: string }>(id, 'v1');

    return (
        <div>
            <label>
                BookmarkId:
                <input size={40} value={id} onChange={(e) => setId(e.currentTarget.value)} />
            </label>
            <pre>
                <code>{JSON.stringify(bookmark, null, 2)}</code>
            </pre>
        </div>
    );
};

export default GetBookmark;
