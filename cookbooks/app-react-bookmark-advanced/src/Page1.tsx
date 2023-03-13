import { useBookmarkContext } from './Provider';

export function Page1() {
    const { updateState, payload } = useBookmarkContext();

    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'row',
                gap: '1rem',
                width: '800px',
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
                </div>
            </div>
        </div>
    );
}
