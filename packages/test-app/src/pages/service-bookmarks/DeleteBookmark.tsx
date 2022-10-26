import { useEffect, useState } from 'react';

import { ApiVersions } from '@equinor/fusion-framework-module-services/bookmarks/get/index';

import { useBookmarksClient } from './useBookmarksClient';

const useDeleteBookmark = <TVersion extends ApiVersions, TPayload>(
    id: string,
    version: TVersion
) => {
    const client = useBookmarksClient<'json$', TPayload>('json$');

    useEffect(() => {
        if (client && id.trim().length === 36) {
            const subscription = client.delete(version, { id }).subscribe(() => {
                console.log('delete bookmark successful');
            });
            return () => subscription.unsubscribe();
        }
    }, [client, version, id]);
};

export const GetBookmark = () => {
    const [id, setId] = useState('86c4e16a-0005-44c4-a545-72fb7c48b348');
    const bookmark = useDeleteBookmark<'v1', { id: string }>(id, 'v1');

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
