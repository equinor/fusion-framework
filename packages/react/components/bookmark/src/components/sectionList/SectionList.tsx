import { Icon } from '@equinor/eds-core-react';
import { useBookmarkGrouping } from '../../hooks';
import { Row } from '../row/Row';
import { Section } from '../section/Section';
import { SharedIcon } from '../shared/SharedIcon';
import { Bookmark } from '@equinor/fusion-framework-module-bookmark';
import { useBookmark } from '@equinor/fusion-framework-react-module-bookmark';
import { useCurrentUser } from '@equinor/fusion-framework-react/hooks';
import { useCallback, useState } from 'react';
import { delete_to_trash, share, edit, close } from '@equinor/eds-icons';
import { useFramework } from '@equinor/fusion-framework-react';
import { appendBookmarkIdToUrl } from '../../utils/append-bookmark-to-uri';
import { filterEmptyGroups, sortByName, toHumanReadable } from '../../utils/utils';

Icon.add({
    delete_to_trash,
    edit,
    share,
    close,
});

type SectionListProps = {
    bookmarkGroups: ReturnType<typeof useBookmarkGrouping>['bookmarkGroups'];
};

export const SectionList = ({ bookmarkGroups }: SectionListProps) => {
    const { deleteBookmarkById, getCurrentAppKey, updateBookmark, removeBookmarkFavorite } =
        useBookmark();

    const user = useCurrentUser();
    const [isMenuByIdOpen, setIsMenuByIdOpen] = useState('');

    const { event } = useFramework().modules;

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

    const createMenuOptions = (bookmark: Bookmark) =>
        createBookmarkActions(
            bookmark,
            deleteBookmarkById,
            editBookmark,
            shareBookmark,
            removeBookmarkFavorite,
            getCurrentAppKey(),
            user?.localAccountId
        );

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
    updateBookmark: (bookmark: Bookmark) => void,
    removeBookmarkFavorite: (bookmarkId: string) => void,
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
                    updateBookmark(bookmark);
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
