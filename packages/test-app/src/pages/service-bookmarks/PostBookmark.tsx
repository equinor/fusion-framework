import { useRef, useState } from 'react';

import { useBookmarksClient } from './useBookmarksClient';
import {
    ApiVersions,
    PostBookmarkResult,
    PostBookmarkArgs,
} from '@equinor/fusion-framework-module-services/bookmarks/post/index';

const usePostBookmark = <TVersion extends ApiVersions, TPayload>(version: TVersion) => {
    const [bookmark, setBookmark] = useState<PostBookmarkResult<TVersion, TPayload> | null>(null);
    const client = useBookmarksClient<'json$', TPayload>('json$');

    return {
        bookmark,
        createBookmark: async (args: PostBookmarkArgs<TVersion>) =>
            new Promise<PostBookmarkResult<TVersion, TPayload>>((res, rej) => {
                const sub = client?.post(version, args).subscribe({
                    next: (val) => {
                        setBookmark(val);
                        sub?.unsubscribe();
                        res(val);
                    },
                    error: rej,
                });
            }),
    };
};

export const PostBookmark = () => {
    const { bookmark, createBookmark } = usePostBookmark<'v1', { id: string }>('v1');
    const formState = useRef({
        name: '',
        description: '',
        appKey: '',
        payload: '',
        isShared: false,
    });

    return (
        <div>
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    console.log('Creating bookmark');
                    createBookmark({
                        ...formState.current,
                        payload: JSON.parse(formState.current.payload),
                    });
                }}
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2em' }}>
                    name
                    <input
                        type={'text'}
                        onChange={(e) => (formState.current.name = e.target.value)}
                    />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2em' }}>
                    description
                    <input
                        type={'text'}
                        onChange={(e) => (formState.current.description = e.target.value)}
                    />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2em' }}>
                    appKey
                    <input
                        type={'text'}
                        onChange={(e) => (formState.current.appKey = e.target.value)}
                    />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2em' }}>
                    payload
                    <textarea onChange={(e) => (formState.current.payload = e.target.value)} />
                </div>
                <div>
                    isShared
                    <input
                        type={'checkbox'}
                        onChange={(e) => (formState.current.isShared = Boolean(e.target.value))}
                    />
                </div>
                <button type="submit">Create</button>
            </form>

            <pre>
                <code>{JSON.stringify(bookmark, null, 2)}</code>
            </pre>
        </div>
    );
};
