import { Button, Dialog } from '@equinor/eds-core-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

import styled from 'styled-components';
import { useBookmarkComponentContext } from '../BookmarkProvider';
import { EMPTY, filter, from, of } from 'rxjs';
import { switchMap, withLatestFrom } from 'rxjs/operators';
import { useObservableState } from '@equinor/fusion-observable/react';

const Styled = {
    Actions: styled.div`
        display: flex;
        gap: 1rem;
    `,
};

export const ImportBookmarkModal = () => {
    const [isOpen, setIsOpen] = useState(false);

    const { provider } = useBookmarkComponentContext();

    // Observe changes to current bookmark and check if it is already in bookmarks or favorites
    const newBookmark$ = useMemo(() => {
        return provider.currentBookmark$.pipe(
            filter((bookmark) => !!bookmark),
            withLatestFrom(provider.bookmarks$),
            switchMap(([bookmark, bookmarks]) => {
                if (bookmarks.find((b) => b.id === bookmark?.id)) {
                    return EMPTY;
                }
                console.log('Checking if bookmark is in favorites', bookmark);
                return of(bookmark);
            }),
            switchMap((bookmark) =>
                from(provider.isBookmarkInFavorites(bookmark.id)).pipe(
                    switchMap((isFavorite) => {
                        console.log(555, 'Is favorite', isFavorite);
                        if (isFavorite) {
                            return EMPTY;
                        }
                        return of(bookmark);
                    }),
                ),
            ),
        );
    }, [provider]);

    const { value: newBookmark } = useObservableState(newBookmark$);

    useEffect(() => {
        if (newBookmark) {
            setIsOpen(true);
        }
    }, [newBookmark]);

    const onAddBookmarkFavorite = useCallback(
        (e: React.MouseEvent<HTMLButtonElement>) => {
            from(provider.addBookmarkToFavorites(e.currentTarget.value)).subscribe({
                next: (bookmark) => {
                    console.log(333, 'Bookmark added to favorites', bookmark);
                },
                error: (error) => {
                    console.error('Failed to add bookmark to favorites', error);
                },
                complete: () => {
                    console.log('Bookmark added to favorites');
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
                    <Button
                        onClick={() => setIsOpen(false)}
                        variant={'ghost'}
                        style={{ width: '70px' }}
                    >
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
