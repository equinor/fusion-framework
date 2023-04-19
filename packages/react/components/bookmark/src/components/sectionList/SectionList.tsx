import { Icon } from '@equinor/eds-core-react';
import { useBookmarkGrouping } from '../../hooks';
import { Row } from '../row/Row';
import { Section } from '../section/Section';
import { SharedIcon } from '../shared/SharedIcon';
import { Bookmark } from '@equinor/fusion-framework-module-bookmark';
import { useBookmark } from '@equinor/fusion-framework-react-module-bookmark';
import { useCurrentUser } from '@equinor/fusion-framework-react/hooks';
import { useCallback, useEffect, useState } from 'react';
import { delete_to_trash, share, edit, close, update } from '@equinor/eds-icons';
import { useFramework } from '@equinor/fusion-framework-react';
import { appendBookmarkIdToUrl } from '../../utils/append-bookmark-to-uri';
import { filterEmptyGroups, sortByName, toHumanReadable } from '../../utils/utils';
import { Loading } from '../loading/Loading';

Icon.add({
    delete_to_trash,
    edit,
    share,
    close,
    update,
});

type SectionListProps = {
    bookmarkGroups: ReturnType<typeof useBookmarkGrouping>['bookmarkGroups'];
};

export const SectionList = ({ bookmarkGroups }: SectionListProps) => {
    const { deleteBookmarkById, getCurrentAppKey, updateBookmark, removeBookmarkFavorite } =
        useBookmark();

    const [loading, setLoading] = useState(true);

    const user = useCurrentUser();
    const [isMenuByIdOpen, setIsMenuByIdOpen] = useState('');

    const { event } = useFramework().modules;

    useEffect(() => {
        return event.addEventListener('onBookmarksChanged', () => {
            setLoading(false);
        });
    }, [event]);

    const editBookmark = useCallback(
        (bookmarkId: string) => {
            event.dispatchEvent('onBookmarkEdit', { detail: { bookmarkId } });
        },
        [event]
    );

    const shareBookmark = useCallback(
        (bookmark: Bookmark) => {
            if (!bookmark.isShared) {
                const url = appendBookmarkIdToUrl(bookmark.id);
                navigator.clipboard.writeText(url);
                event.dispatchEvent('onBookmarkUrlCopy', { detail: { url } });
            }
            updateBookmark({ ...bookmark, isShared: !bookmark.isShared });
        },
        [event, updateBookmark]
    );

    const updateBookmarkWithCurrentView = useCallback(
        (bookmark: Bookmark) => {
            updateBookmark({ ...bookmark }, { updatePayload: true });
        },
        [updateBookmark]
    );

    const createMenuOptions = (bookmark: Bookmark) =>
        createBookmarkActions(
            bookmark,
            deleteBookmarkById,
            editBookmark,
            shareBookmark,
            removeBookmarkFavorite,
            updateBookmarkWithCurrentView,
            getCurrentAppKey(),
            user?.localAccountId
        );

    if (loading) return <Loading />;

    return (
        <>
            {bookmarkGroups.filter(filterEmptyGroups).map(({ groupingProperty, values }) => (
                <Section key={groupingProperty} name={toHumanReadable(groupingProperty)}>
                    {values.sort(sortByName).map((b) => (
                        <Row
                            menuOptions={createMenuOptions(b)}
                            key={b.id}
                            name={b.name}
                            id={b.id}
                            menuOpen={isMenuByIdOpen === b.id}
                            onMenuOpen={(id: string) => {
                                setIsMenuByIdOpen(id);
                            }}
                        >
                            {b.isShared && (
                                <SharedIcon
                                    createdById={b.createdBy.azureUniqueId}
                                    createdBy={b.createdBy.name}
                                />
                            )}
                        </Row>
                    ))}
                </Section>
            ))}
        </>
    );
};

function createBookmarkActions(
    bookmark: Bookmark,
    deleteBookmarkById: (bookmarkId: string) => Promise<string>,
    editBookmark: (bookmark: string) => void,
    shareBookmark: (bookmark: Bookmark) => void,
    removeBookmarkFavorite: (bookmarkId: string) => void,
    updateBookmarkWithCurrentView: (bookmark: Bookmark) => void,
    appKey?: string,
    localAccountId?: string
) {
    if (bookmark.createdBy.azureUniqueId === localAccountId) {
        return [
            {
                name: 'Edit',
                disabled: appKey !== bookmark.appKey,
                onClick: () => {
                    editBookmark(bookmark.id);
                },
                Icon: <Icon name="edit" />,
            },
            {
                name: 'Update with current view',
                disabled: appKey !== bookmark.appKey,
                onClick: () => {
                    updateBookmarkWithCurrentView(bookmark);
                },
                Icon: <Icon name="update" />,
            },
            {
                name: 'Remove',
                disabled: false,
                onClick: () => {
                    deleteBookmarkById(bookmark.id);
                },
                Icon: <Icon name="delete_to_trash" />,
            },
            {
                name: bookmark.isShared ? 'Unshare' : 'Share',
                disabled: false,
                onClick: () => {
                    shareBookmark(bookmark);
                },
                Icon: <Icon name="share" />,
            },
        ];
    } else {
        return [
            {
                name: 'Unfavourite',
                disabled: false,
                onClick: () => {
                    removeBookmarkFavorite(bookmark.id);
                },
                Icon: <Icon name="close" />,
            },
        ];
    }
}
