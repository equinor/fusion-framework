import { useCurrentBookmark } from '@equinor/fusion-framework-react-app/bookmark';
import { useCallback, useId, useLayoutEffect, useRef, useState } from 'react';

export interface MyPayload {
  title: string;
  data: string;
}

export const App = () => {
  const titleId = useId();
  const dataId = useId();
  const [payload, setPayload] = useState({
    title: '',
    data: '',
  });

  const updateData = useRef(payload);

  const { currentBookmark } = useCurrentBookmark<MyPayload>(
    useCallback(() => updateData.current, []),
  );

  useLayoutEffect(() => {
    setPayload({
      title: currentBookmark?.payload?.title ?? '',
      data: currentBookmark?.payload?.data ?? '',
    });
  }, [currentBookmark]);

  useLayoutEffect(() => {
    updateData.current = payload;
  }, [payload]);

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
          <label htmlFor={titleId}>Title</label>
          <input
            id={titleId}
            type="text"
            onChange={(e) => {
              setPayload((x) => ({
                ...x,
                title: e.target.value,
              }));
            }}
            value={payload.title}
          />
          <label htmlFor={dataId}>Bookmark data:</label>
          <input
            id={dataId}
            type="text"
            onChange={(e) => {
              setPayload((x) => ({
                ...x,
                data: e.target.value,
              }));
            }}
            value={payload.data}
          />
        </form>
        <pre>{JSON.stringify(currentBookmark, null, 2)}</pre>
      </div>
    </div>
  );
};

export default App;
