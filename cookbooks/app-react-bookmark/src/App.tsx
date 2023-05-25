import { useCurrentBookmark } from '@equinor/fusion-framework-react-app/bookmark';
import { useCallback, useEffect, useState } from 'react';

export interface MyBookmark {
    title: string;
    data: string;
}

export interface BookmarkState {
    payload: MyBookmark;
}

export const init = {
    payload: {
        title: '',
        data: '',
    },
};

export const App = () => {
    const [state, setState] = useState<BookmarkState>(init);

    const updateState = useCallback(
        (newState: () => Partial<BookmarkState>) => {
            setState((s) => ({ ...s, ...newState() }));
        },
        [setState]
    );
    const currentBookmark = useCurrentBookmark<MyBookmark>(
        useCallback(() => state.payload, [state.payload])
    );

    useEffect(() => {
        currentBookmark.currentBookmark && setState(currentBookmark.currentBookmark);
    }, [currentBookmark.currentBookmark]);

    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'row',
                gap: '1rem',
            }}
        >
            <div
                style={{
                    padding: '1rem',
                }}
            >
                <h1>🚀 Fusion Bookmark😎</h1>
                <form style={{ display: 'flex', gap: '1rem' }}>
                    <label htmlFor="value">Title</label>
                    <input
                        id="value"
                        type="text"
                        onChange={(e) => {
                            updateState(() => ({
                                payload: {
                                    ...state.payload,
                                    title: e.target.value,
                                },
                            }));
                        }}
                        value={state.payload.title}
                    />
                    <label htmlFor="value">Bookmark data:</label>
                    <input
                        id="value"
                        type="text"
                        onChange={(e) => {
                            updateState(() => ({
                                payload: {
                                    ...state.payload,
                                    data: e.target.value,
                                },
                            }));
                        }}
                        value={state.payload.data}
                    />
                </form>
                <pre>{JSON.stringify(currentBookmark, null, 2)}</pre>
            </div>
        </div>
    );
};

export default App;
