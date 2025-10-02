import { useEffect, useId } from 'react';
import { useBookmarkContext } from './Provider';

export function Page2() {
  const titleId = useId();
  const { updateState, payload } = useBookmarkContext();

  useEffect(() => {
    updateState((s) => {
      return { payload: { ...s.payload, page: 'page2' } };
    });
  }, [updateState]);

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
            <label htmlFor={titleId}>Title</label>
            <input
              id={titleId}
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
        </div>
      </div>
    </div>
  );
}
