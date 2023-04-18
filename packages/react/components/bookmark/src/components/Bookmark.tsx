import { Button, Icon } from '@equinor/eds-core-react';
import { chevron_down, chevron_right, share, more_vertical, add } from '@equinor/eds-icons';
import { useBookmark } from '@equinor/fusion-framework-react-module-bookmark';
import { useHasBookmark } from '@equinor/fusion-framework-react-module-bookmark/portal';
import { useEffect } from 'react';
import { css } from '@emotion/css';
import { Bookmarks } from './bookmarks/Bookmarks';
import { useFramework } from '@equinor/fusion-framework-react';

const style = {
    wrapper: css({
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        paddingLeft: '1rem',
    }),
};

Icon.add({
    chevron_down,
    chevron_right,
    share,
    more_vertical,
    add,
});

type BookmarkProps = {
    onClose?: () => void;
};

export const Bookmark = ({ onClose }: BookmarkProps) => {
    const hasBookmark = useHasBookmark();
    const { getAllBookmarks } = useBookmark();
    const { event } = useFramework().modules;

    useEffect(() => {
        getAllBookmarks();
    }, [getAllBookmarks]);

    return (
        <div className={style.wrapper}>
            <div style={{ display: 'flex', gap: '1rem' }}>
                <Button
                    disabled={!hasBookmark}
                    variant="ghost"
                    onClick={() => {
                        onClose && onClose();
                        event.dispatchEvent('onBookmarkOpen', { detail: true });
                    }}
                >
                    <Icon name="add" /> Add Bookmark
                </Button>
            </div>

            <Bookmarks />
        </div>
    );
};
