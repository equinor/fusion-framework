import { Icon } from '@equinor/eds-core-react';
import type { useBookmarkGrouping } from '../../hooks';
import { type MenuOption, Row } from '../row/Row';
import { Section } from '../section/Section';
import { SharedIcon } from '../shared/SharedIcon';
// TODO - export from `@equinor/fusion-framework-react-module-bookmark`
import type { BookmarkWithoutData } from '@equinor/fusion-framework-module-bookmark';
import { useCurrentUser } from '@equinor/fusion-framework-react/hooks';
import { useCallback, useState } from 'react';
import { delete_to_trash, share, edit, close, update } from '@equinor/eds-icons';
import { filterEmptyGroups, sortByName, toHumanReadable } from '../../utils/utils';
import { useBookmarkComponentContext } from '../BookmarkProvider';
import { from } from 'rxjs';

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

  const { provider, currentApp, showEditBookmark, addBookmarkToClipboard } =
    useBookmarkComponentContext();

  // TODO - should be removed when bookmark has property for isOwner
  const user = useCurrentUser();

  const [isMenuByIdOpen, setIsMenuByIdOpen] = useState('');

  const createMenuOptions = useCallback(
    (bookmark: BookmarkWithoutData) => {
      if (!provider) return [];
      const appKey = currentApp?.appKey;
      const bookmarkId = bookmark.id;
      const isOwner = bookmark.createdBy.id === user?.localAccountId;

      const copyUrl = {
        name: 'Copy URL',
        disabled: false,
        onClick: async () => {
          addBookmarkToClipboard(bookmark.id);
        },
        Icon: <Icon name="share" />,
      };

      if (isOwner) {
        const ownerOptions = [
          {
            name: 'Edit',
            disabled: appKey !== bookmark.appKey,
            onClick: () => {
              showEditBookmark(bookmarkId);
            },
            Icon: <Icon name="edit" />,
          },
          {
            name: 'Update with current view',
            disabled: appKey !== bookmark.appKey,
            onClick: () => {
              // TODO: add success and failure message
              from(
                provider.updateBookmark(bookmark.id, undefined, {
                  excludePayloadGeneration: false,
                }),
              ).subscribe({
                error(err) {
                  console.error('Failed to update bookmark with current view', err);
                },
                complete() {
                  console.debug('Bookmark updated with current view');
                },
              });
            },
            Icon: <Icon name="update" />,
          },
          {
            name: 'Remove',
            disabled: false,
            onClick: () => {
              // TODO: add success and failure message
              from(provider.deleteBookmark(bookmark.id)).subscribe({
                error(err) {
                  console.error('Failed to remove bookmark', err);
                },
                complete() {
                  console.debug('Bookmark removed');
                },
              });
            },
            Icon: <Icon name="delete_to_trash" />,
          },
          {
            name: bookmark.isShared ? 'Unshare' : 'Share',
            disabled: false,
            onClick: async () => {
              from(
                provider.updateBookmark(bookmark.id, {
                  isShared: !bookmark.isShared,
                }),
              ).subscribe({
                next(value) {
                  if (value.isShared) {
                    addBookmarkToClipboard(value.id);
                  }
                },
                error(err) {
                  console.error('Failed to update bookmark', err);
                },
                complete() {
                  console.debug('Bookmark updated');
                },
              });
            },
            Icon: <Icon name="share" />,
          },
        ] as MenuOption[];

        return bookmark.isShared ? [...ownerOptions, copyUrl] : ownerOptions;
      }

      return [
        copyUrl,
        {
          name: 'Unfavourite',
          disabled: false,
          onClick: () => {
            from(provider.removeBookmarkAsFavorite(bookmark.id)).subscribe({
              error(err) {
                console.error('Failed to remove bookmark from favorites', err);
              },
              complete() {
                console.debug('Bookmark removed from favorites');
              },
            });
          },
          Icon: <Icon name="close" />,
        },
      ];
    },
    [provider, showEditBookmark, addBookmarkToClipboard, user, currentApp?.appKey],
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
                <SharedIcon createdById={b.createdBy.id} createdBy={b.createdBy.name} />
              )}
            </Row>
          ))}
        </Section>
      ))}
    </>
  );
};
