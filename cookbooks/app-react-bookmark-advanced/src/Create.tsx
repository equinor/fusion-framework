import { useBookmark } from '@equinor/fusion-framework-react-app/bookmark';
import { init, useBookmarkContext } from './Provider';

export const Create = () => {
  const { updateState, ...state } = useBookmarkContext();

  const { bookmarks, updateBookmark, deleteBookmarkById, createBookmark, setCurrentBookmark } =
    useBookmark();

  return (
    <div
      style={{
        position: 'fixed',
        right: '0',
        top: '58px',
        height: '100%',
        width: '250px',
        borderLeft: '1 solid #11111',
        display: 'flex',
        flexDirection: 'row',
        gap: '1rem',
        background: '#f3f3f3',
        padding: '1rem',
      }}
    >
      <div style={{ flex: 2 }}>
        <h1>🚀 Create Fusion Bookmark😎</h1>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
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
                updateState(() => ({ name: e.target.value }));
              }}
              value={state.name}
            />

            <label htmlFor="description">Description</label>
            <textarea
              rows={2}
              id="description"
              onChange={(e) => {
                updateState(() => ({ description: e.target.value }));
              }}
              value={state.description}
            />

            <label htmlFor="value">Title</label>
            <input
              id="value"
              type="text"
              onChange={(e) => {
                updateState((s) => ({
                  payload: {
                    ...s.payload,
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
                updateState((s) => ({
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
            type="button"
            disabled={state.name.length < 2 || state.description.length < 3}
            onClick={() => {
              createBookmark(state);
            }}
          >
            Create Bookmark
          </button>

          <button
            type="button"
            onClick={() => {
              updateState(() => init);
            }}
          >
            Clear Form
          </button>
          <div style={{ height: '600px', overflow: 'auto' }}>
            {bookmarks
              .filter((b) => b.appKey === 'fusion-framework-cookbook-app-react-bookmark-advanced')
              .map((bookmark) => (
                <div key={bookmark.id} style={{ display: 'flex' }}>
                  <button
                    type="button"
                    style={{
                      display: 'flex',
                      textAlign: 'start',
                      padding: '1rem',
                    }}
                    onClick={() => {
                      setCurrentBookmark(bookmark.id);
                    }}
                  >
                    <div>
                      <h4 style={{ margin: 0 }}>{bookmark.name}</h4>
                      <p style={{ marginTop: '0.25rem' }}>{bookmark.description}</p>
                      <p style={{ fontSize: '10px' }}>{bookmark.id}</p>
                    </div>
                  </button>
                  <div>
                    <button
                      type="button"
                      style={{ display: 'flex' }}
                      onClick={() => {
                        deleteBookmarkById(bookmark.id);
                      }}
                    >
                      x
                    </button>
                    <button
                      type="button"
                      style={{ display: 'flex' }}
                      onClick={() => {
                        updateBookmark({
                          ...bookmark,
                          ...state,
                        });
                      }}
                    >
                      u
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Create;
