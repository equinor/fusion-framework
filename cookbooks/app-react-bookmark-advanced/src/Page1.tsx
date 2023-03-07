import { BookmarkModule } from '@equinor/fusion-framework-module-bookmark';
import { useFramework } from '@equinor/fusion-framework-react';
import { useBookmark } from '@equinor/fusion-framework-react-module-bookmark/portal';
import { useEffect } from 'react';
import { useBookmarkContext } from './Provider';

export function Page1() {
    const { updateState, payload, name, description, isShared } = useBookmarkContext();
    const bookmarkProvider = useFramework<[BookmarkModule]>().modules.bookmark;

    const { createBookmark } = useBookmark(bookmarkProvider);
    useEffect(() => {
        updateState((s) => ({ payload: { ...s.payload, page: 'page1' } }));
    }, []);

    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'row',
                gap: '1rem',
            }}
        >
            <div style={{ flex: 2 }}>
                <h1>Page1 😎</h1>
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1rem',
                        padding: '1rem',
                        background: '#f3f3f3',
                    }}
                >
                    <form
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '1rem',
                        }}
                    >
                        <label htmlFor="value">Bookmark data:</label>
                        <input
                            id="value"
                            type="text"
                            onChange={(e) => {
                                updateState((s) => ({
                                    payload: {
                                        ...s.payload,
                                        data: e.target.value,
                                    },
                                }));
                            }}
                            value={payload.data}
                        />
                    </form>
                    <button
                        disabled={name.length < 2 || description.length < 3}
                        onClick={() => {
                            createBookmark({ name, description, isShared });
                        }}
                    >
                        Create Bookmark
                    </button>
                </div>
            </div>
        </div>
    );
}
