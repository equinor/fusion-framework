import { Button, Dialog } from '@equinor/eds-core-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

import styled from 'styled-components';
import { useBookmarkComponentContext } from '../BookmarkProvider';
import { filter, from, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { useObservableState } from '@equinor/fusion-observable/react';

const Styled = {
  Actions: styled.div`
        display: flex;
        gap: 1rem;
    `,
};

export const ImportBookmarkModal = () => {
  const [isOpen, setIsOpen] = useState(false);

  const { provider, currentUser } = useBookmarkComponentContext();

  // Observe changes to current bookmark and check if it is already in bookmarks or favorites
  const newBookmark$ = useMemo(() => {
    if (!provider) {
      return of(null);
    }
    return provider.currentBookmark$.pipe(
      // filter out null values, not interested in those
      filter((bookmark) => !!bookmark),
      switchMap((bookmark) => {
        const checkBookmark = bookmark && bookmark.createdBy.id !== currentUser?.id;
        if (!checkBookmark) {
          return of(null);
        }
        return from(provider.isBookmarkInFavorites(bookmark.id)).pipe(
          map((isFavorite) => (isFavorite ? null : bookmark)),
        );
      }),
    );
  }, [provider, currentUser?.id]);

  const { value: newBookmark } = useObservableState(newBookmark$);

  useEffect(() => {
    if (newBookmark) {
      setIsOpen(true);
    }
  }, [newBookmark]);

  const onAddBookmarkFavorite = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      if (!provider) {
        console.error('Provider not available');
        return;
      }
      from(provider.addBookmarkToFavorites(e.currentTarget.value)).subscribe({
        complete: () => {
          setIsOpen(false);
        },
      });
    },
    [provider],
  );

  if (!newBookmark) {
    return null;
  }

  return (
    <Dialog style={{ width: '600px' }} open={isOpen}>
      <Dialog.Header>Import bookmark</Dialog.Header>
      <Dialog.Content>
        <p>This bookmark was created by {newBookmark.createdBy.name}</p>
        <p>Would you like to import it?</p>
      </Dialog.Content>
      <Dialog.Actions>
        <Styled.Actions>
          <Button onClick={() => setIsOpen(false)} variant={'ghost'} style={{ width: '70px' }}>
            No
          </Button>
          <Button value={newBookmark.id} onClick={onAddBookmarkFavorite} variant="ghost">
            Import
          </Button>
        </Styled.Actions>
      </Dialog.Actions>
    </Dialog>
  );
};
