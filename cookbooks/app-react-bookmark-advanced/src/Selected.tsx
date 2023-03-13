import { useCurrentBookmark } from '@equinor/fusion-framework-react-app/bookmark';

export const Selected = () => {
    const { currentBookmark } = useCurrentBookmark();

    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'row',
                gap: '1rem',
            }}
        >
            {!currentBookmark && <p>No bookmark selected</p>}
            <pre>{JSON.stringify(currentBookmark, null, 2)}</pre>
        </div>
    );
};

export default Selected;
