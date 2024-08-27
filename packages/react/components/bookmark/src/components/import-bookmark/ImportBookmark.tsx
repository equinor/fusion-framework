import { Button, Dialog } from '@equinor/eds-core-react';
import { useObservableState } from '@equinor/fusion-observable/react';
import { useCallback, useEffect, useMemo, useState } from 'react';

import styled from 'styled-components';
import { useBookmarkComponentContext } from '../BookmarkProvider';
import { useCurrentBookmark } from '@equinor/fusion-framework-react-module-bookmark';

const Styled = {
    Actions: styled.div`
        display: flex;
        gap: 1rem;
    `,
};

export const ImportBookmarkModal = () => {
    const [isOpen, setIsOpen] = useState(false);

    const { provider } = useBookmarkComponentContext();
    const { value: bookmarks, complete: bookmarksLoaded } = useObservableState(
        useMemo(() => provider.bookmarks$, [provider]),
        { initial: [] },
    );

    const { currentBookmark } = useCurrentBookmark({ provider });

    useEffect(() => {
        if (bookmarksLoaded && currentBookmark) {
            // TODO: this should rather use the provider.isFavorite, but the bookmark should have flag for if the bookmark is created by the user
            const hasBookmark = bookmarks.find(({ id }) => id === currentBookmark.id);
            if (!hasBookmark) {
                setIsOpen(true);
            }
        }
    }, [bookmarks, currentBookmark, bookmarksLoaded]);

    const onAddBookmarkFavorite = useCallback(async () => {
        if (currentBookmark) {
            try {
                // TODO: missing state for disabling button
                await provider.addBookmarkToFavoritesAsync(currentBookmark.id);
                // TODO: Show success message
            } catch (error) {
                console.error('Failed to add bookmark to favorites', error);
                // TODO: Show error message
            }
            await provider.addBookmarkToFavoritesAsync(currentBookmark.id);
        } else {
            console.error('No bookmark to add to favorites');
            // TODO: Show error message
        }
    }, [provider, currentBookmark]);

    return (
        <Dialog style={{ width: '600px' }} open={isOpen}>
            <Dialog.Header>Import bookmark</Dialog.Header>
            <Dialog.Content>
                <p>This bookmark was created by {currentBookmark?.createdBy.name}</p>
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
                    <Button onClick={onAddBookmarkFavorite} variant="ghost">
                        Import
                    </Button>
                </Styled.Actions>
            </Dialog.Actions>
        </Dialog>
    );
};
