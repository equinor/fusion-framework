import { Icon } from '@equinor/eds-core-react';
import { useBookmarkGrouping } from '../../hooks';
import { Row } from '../row/Row';
import { Section } from '../section/Section';
import { SharedIcon } from '../shared/SharedIcon';
// TODO - export from `@equinor/fusion-framework-react-module-bookmark`
import type { BookmarkWithoutData } from '@equinor/fusion-framework-module-bookmark';
import { useCurrentUser } from '@equinor/fusion-framework-react/hooks';
import { useCallback, useState } from 'react';
import { delete_to_trash, share, edit, close, update } from '@equinor/eds-icons';
import { useFramework } from '@equinor/fusion-framework-react';
import { appendBookmarkIdToUrl } from '../../utils/append-bookmark-to-uri';
import { filterEmptyGroups, sortByName, toHumanReadable } from '../../utils/utils';
import { AppModule } from '@equinor/fusion-framework-module-app';
import { useBookmarkComponentContext } from '../BookmarkProvider';

Icon.add({
    delete_to_trash,
    edit,
    share,
    close,
    update,
});

type SectionListProps = {
    readonly bookmarkGroups: ReturnType<typeof useBookmarkGrouping>['bookmarkGroups'];
};

export const SectionList = ({ bookmarkGroups }: SectionListProps) => {
    // const { deleteBookmarkById, updateBookmark, removeBookmarkFavorite } = useBookmark();

    const { provider: bookmarkProvider, currentApp } = useBookmarkComponentContext();

    // TODO - should be removed when bookmark has property for isOwner
    const user = useCurrentUser();

    const [isMenuByIdOpen, setIsMenuByIdOpen] = useState('');

    const { event: eventProvider } = useFramework<[AppModule]>().modules;

    const createMenuOptions = useCallback(
        (bookmark: BookmarkWithoutData) => {
            const appKey = currentApp?.appKey;
            const bookmarkId = bookmark.id;
            const isOwner = bookmark.createdBy.azureUniqueId === user?.localAccountId;
            if (isOwner) {
                return [
                    {
                        name: 'Edit',
                        disabled: appKey !== bookmark.appKey,
                        onClick: () => {
                            eventProvider.dispatchEvent('onBookmarkEdit', {
                                detail: { bookmarkId },
                            });
                        },
                        Icon: <Icon name="edit" />,
                    },
                    {
                        name: 'Update with current view',
                        disabled: appKey !== bookmark.appKey,
                        onClick: () => {
                            bookmarkProvider.updateBookmarkAsync(bookmark.id);
                            // TODO: add success and failure message
                        },
                        Icon: <Icon name="update" />,
                    },
                    {
                        name: 'Remove',
                        disabled: false,
                        onClick: () => {
                            bookmarkProvider.deleteBookmarkAsync(bookmark.id);
                            // TODO: add success and failure message
                        },
                        Icon: <Icon name="delete_to_trash" />,
                    },
                    {
                        name: bookmark.isShared ? 'Unshare' : 'Share',
                        disabled: false,
                        onClick: () => {
                            if (!bookmark.isShared) {
                                const url = appendBookmarkIdToUrl(bookmark.id);
                                navigator.clipboard.writeText(url);
                                eventProvider.dispatchEvent('onBookmarkUrlCopy', {
                                    detail: { url },
                                });
                            }

                            // TODO - this flag should only be set by backend when sharing is successful
                            bookmarkProvider.updateBookmarkAsync(
                                bookmark.id,
                                { isShared: !bookmark.isShared },
                                { excludePayloadGeneration: true },
                            );
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
                            bookmarkProvider.deleteBookmarkAsync(bookmark.id);
                        },
                        Icon: <Icon name="close" />,
                    },
                ];
            }
        },
        [eventProvider, bookmarkProvider, user, currentApp?.appKey],
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
