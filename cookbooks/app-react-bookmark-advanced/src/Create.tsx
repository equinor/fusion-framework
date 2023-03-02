import { BookmarkModule } from '@equinor/fusion-framework-module-bookmark';
import { useFramework } from '@equinor/fusion-framework-react';
import { useAppModule } from '@equinor/fusion-framework-react-app';
import { useCurrentBookmark } from '@equinor/fusion-framework-react-app/bookmark';
import { useBookmark } from '@equinor/fusion-framework-react-module-bookmark/portal';
import { useCallback, useEffect, useState } from 'react';

interface MyBookmark {
    myId: string;
    data: string;
}

interface BookmarkState {
    name: string;
    description: string;
    isShared: boolean;
    payload: MyBookmark;
}

const init = {
    name: '',
    description: '',
    isShared: false,
    payload: {
        myId: '',
        data: '',
    },
};

export const Create = () => {
    const bookmarkModule = useAppModule<BookmarkModule>('bookmark');
    const bookmarkProvider = useFramework<[BookmarkModule]>().modules.bookmark;

    const [state, setState] = useState<BookmarkState>(init);

    const {
        bookmarks,
        getAllBookmarks,
        updateBookmark,
        deleteBookmarkById,
        createBookmark,
        setCurrentBookmark,
    } = useBookmark(bookmarkProvider);

    const { currentBookmark } = useCurrentBookmark(
        useCallback(() => state.payload, [state.payload])
    );

    useEffect(() => {
        if (currentBookmark) setState(currentBookmark as BookmarkState);
    }, [currentBookmark]);

    useEffect(() => {
        getAllBookmarks();
    }, []);

    if (!bookmarkModule) return <div>No bookmark module</div>;

    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'row',
                gap: '1rem',
            }}
        >
            <div style={{ flex: 2 }}>
                <h1>🚀 Hello Fusion Bookmark😎</h1>
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
                        <label htmlFor="name">Name:</label>
                        <input
                            id="name"
                            type="text"
                            onChange={(e) => {
                                setState((s) => ({ ...s, name: e.target.value }));
                            }}
                            value={state.name}
                        />

                        <label htmlFor="description">Description</label>
                        <textarea
                            rows={10}
                            id="description"
                            onChange={(e) => {
                                setState((s) => ({ ...s, description: e.target.value }));
                            }}
                            value={state.description}
                        />

                        <label htmlFor="value">myId:</label>
                        <input
                            id="value"
                            type="text"
                            onChange={(e) => {
                                setState((s) => ({
                                    ...s,
                                    payload: {
                                        ...s.payload,
                                        myId: e.target.value,
                                    },
                                }));
                            }}
                            value={state.payload.myId}
                        />
                        <label htmlFor="value">Bookmark data:</label>
                        <input
                            id="value"
                            type="text"
                            onChange={(e) => {
                                setState((s) => ({
                                    ...s,
                                    payload: {
                                        ...s.payload,
                                        data: e.target.value,
                                    },
                                }));
                            }}
                            value={state.payload.data}
                        />
                    </form>
                    <button
                        disabled={state.name.length < 2 || state.description.length < 3}
                        onClick={() => {
                            createBookmark(state);
                        }}
                    >
                        Create Bookmark
                    </button>
                    <button
                        disabled={!currentBookmark}
                        onClick={() => {
                            if (currentBookmark) {
                                updateBookmark({
                                    ...currentBookmark,
                                    ...state,
                                });
                            }
                        }}
                    >
                        Update Bookmark
                    </button>
                    <button
                        onClick={() => {
                            setState(init);
                            // setBookmark(undefined);
                        }}
                    >
                        Clear Bookmark
                    </button>
                    <button
                        disabled={!currentBookmark}
                        onClick={() => {
                            if (currentBookmark) deleteBookmarkById(currentBookmark?.id);
                            setState(init);
                            // setBookmark(undefined);
                        }}
                    >
                        Delete Bookmark
                    </button>
                    <pre>{JSON.stringify(currentBookmark, null, 2)}</pre>
                </div>
            </div>

            <div
                style={{
                    marginTop: '1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem',
                    padding: '1rem',
                    background: '#f3f3f3',
                    flex: 1,
                }}
            >
                {bookmarks.map((bookmark) => (
                    <button
                        key={bookmark.id}
                        style={{ display: 'flex' }}
                        onClick={() => {
                            setCurrentBookmark(bookmark.id);
                        }}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            version="1.1"
                            width="50"
                            height="50"
                            viewBox="0 0 256 256"
                        >
                            <defs></defs>
                            <g
                                style={{
                                    stroke: 'none',
                                    strokeWidth: 0,
                                    strokeDasharray: 'none',
                                    strokeLinecap: 'butt',
                                    strokeLinejoin: 'miter',
                                    strokeMiterlimit: 10,
                                    fill: 'none',
                                    fillRule: 'nonzero',
                                    opacity: 1,
                                }}
                                transform="translate(1.4065934065934016 1.4065934065934016) scale(2.81 2.81)"
                            >
                                <path
                                    d="M 15.181 89.999 c -0.763 0 -1.529 -0.182 -2.234 -0.55 c -1.597 -0.835 -2.588 -2.472 -2.588 -4.274 V 7.504 C 10.358 3.366 13.725 0 17.862 0 h 54.276 c 4.137 0 7.503 3.366 7.503 7.504 v 77.672 c 0 1.801 -0.991 3.439 -2.588 4.273 c -1.598 0.836 -3.506 0.714 -4.985 -0.313 v -0.001 L 47.684 72.177 c -1.606 -1.115 -3.763 -1.115 -5.367 0 L 17.932 89.134 C 17.107 89.708 16.146 89.999 15.181 89.999 z M 74.352 85.851 c 0.354 0.244 0.684 0.14 0.85 0.053 c 0.164 -0.086 0.44 -0.295 0.44 -0.728 V 7.504 C 75.642 5.572 74.07 4 72.139 4 H 17.862 c -1.932 0 -3.504 1.572 -3.504 3.504 v 77.672 c 0 0.433 0.276 0.642 0.441 0.728 c 0.166 0.088 0.494 0.193 0.849 -0.053 l 24.384 -16.957 c 2.972 -2.067 6.966 -2.067 9.935 0 L 74.352 85.851 z"
                                    style={{
                                        stroke: 'none',
                                        strokeWidth: 1,
                                        strokeDasharray: 'none',
                                        strokeLinecap: 'butt',
                                        strokeLinejoin: 'miter',
                                        strokeMiterlimit: 10,
                                        fill: 'rgb(0,0,0)',
                                        fillRule: 'nonzero',
                                        opacity: 1,
                                    }}
                                    transform=" matrix(1 0 0 1 0 0) "
                                    strokeLinecap="round"
                                />
                                <path
                                    d="M 34.439 54.502 c -0.762 0 -1.519 -0.238 -2.166 -0.708 c -1.145 -0.832 -1.708 -2.215 -1.469 -3.61 l 1.689 -9.843 l -7.152 -6.971 c -1.013 -0.987 -1.372 -2.437 -0.935 -3.783 c 0.438 -1.347 1.579 -2.309 2.98 -2.513 l 9.883 -1.436 l 4.42 -8.956 c 0.627 -1.269 1.895 -2.057 3.31 -2.057 s 2.684 0.788 3.31 2.057 c 0 0 0 0 0.001 0 l 4.419 8.956 l 9.883 1.437 c 1.401 0.204 2.543 1.167 2.981 2.513 c 0.438 1.346 0.079 2.795 -0.935 3.783 l -7.151 6.971 l 1.688 9.843 c 0.239 1.395 -0.323 2.777 -1.469 3.609 c -1.145 0.832 -2.636 0.938 -3.887 0.281 L 45 49.427 l -8.84 4.648 C 35.615 54.361 35.026 54.502 34.439 54.502 z M 28.582 30.942 l 6.82 6.648 c 0.871 0.849 1.267 2.07 1.062 3.268 l -1.61 9.385 l 8.429 -4.432 c 1.076 -0.564 2.36 -0.564 3.435 0 l 8.43 4.432 l -1.609 -9.386 c -0.206 -1.196 0.19 -2.419 1.064 -3.268 l 6.818 -6.646 l -9.425 -1.37 c -1.201 -0.174 -2.239 -0.929 -2.778 -2.018 L 45 19.013 l -4.215 8.54 c -0.537 1.089 -1.576 1.844 -2.779 2.019 L 28.582 30.942 z M 52.802 25.782 h 0.01 H 52.802 z M 44.723 18.452 c 0 0 0 0.001 0.001 0.001 L 44.723 18.452 z"
                                    style={{
                                        stroke: 'none',
                                        strokeWidth: 1,
                                        strokeDasharray: 'none',
                                        strokeLinecap: 'butt',
                                        strokeLinejoin: 'miter',
                                        strokeMiterlimit: 10,
                                        fill: 'rgb(0,0,0)',
                                        fillRule: 'nonzero',
                                        opacity: 1,
                                    }}
                                    transform=" matrix(1 0 0 1 0 0) "
                                    strokeLinecap="round"
                                />
                            </g>
                        </svg>
                        <div>
                            <h4 style={{ margin: 0 }}>{bookmark.name}</h4>
                            <p style={{ marginTop: '0.25rem' }}>{bookmark.description}</p>
                            <p style={{ fontSize: '10px' }}>{bookmark.id}</p>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default Create;
