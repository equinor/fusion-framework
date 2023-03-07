import { BookmarkModule } from '@equinor/fusion-framework-module-bookmark';
import { useFramework } from '@equinor/fusion-framework-react';
import { useBookmark } from '@equinor/fusion-framework-react-module-bookmark/portal';
import { useEffect } from 'react';
import { useBookmarkContext } from './Provider';

export function Page2() {
    const { updateState, payload, name, description, isShared } = useBookmarkContext();

    const bookmarkProvider = useFramework<[BookmarkModule]>().modules.bookmark;

    const { createBookmark } = useBookmark(bookmarkProvider);

    useEffect(() => {
        updateState((s) => {
            return { payload: { ...s.payload, page: 'page2' } };
        });
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
                <h1>Page2 🥰</h1>
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
                        <label htmlFor="value">Title</label>
                        <input
                            id="value"
                            type="text"
                            onChange={(e) => {
                                updateState((state) => ({
                                    payload: {
                                        ...state.payload,
                                        title: e.target.value,
                                    },
                                }));
                            }}
                            value={payload.title}
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
