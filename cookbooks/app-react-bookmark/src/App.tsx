import { useCurrentBookmark } from '@equinor/fusion-framework-react-app/bookmark';
import { StrictMode, useCallback, useEffect, useState } from 'react';
import Create from './Create';

export interface MyBookmark {
    title: string;
    data: string;
}

export interface BookmarkState {
    name: string;
    description: string;
    isShared: boolean;
    payload: MyBookmark;
}

export const init = {
    name: '',
    description: '',
    isShared: false,
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
        <StrictMode>
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
                    <pre>{JSON.stringify(currentBookmark, null, 2)}</pre>
                </div>
                <Create state={state} updateState={updateState} />
            </div>
        </StrictMode>
    );
};

export default App;
