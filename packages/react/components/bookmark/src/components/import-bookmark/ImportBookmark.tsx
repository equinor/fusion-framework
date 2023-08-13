import { Button, Dialog } from '@equinor/eds-core-react';
import { useBookmark } from '@equinor/fusion-framework-react-module-bookmark';
import { useEffect, useState } from 'react';

import styled from 'styled-components';

const Styled = {
    Actions: styled.div`
        display: flex;
        gap: 1rem;
    `,
};

export const ImportBookmarkModal = () => {
    const [isOpen, setIsOpen] = useState(false);

    const { currentBookmark, bookmarks, addBookmarkFavorite } = useBookmark();

    useEffect(() => {
        if (!bookmarks || !currentBookmark || bookmarks.length === 0) return;

        if (bookmarks.findIndex(({ id }) => id === currentBookmark.id) === -1) {
            setIsOpen(true);
        }
    }, [bookmarks, currentBookmark]);

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
                    <Button
                        onClick={() => {
                            console.log(currentBookmark?.id);
                            currentBookmark && addBookmarkFavorite(currentBookmark.id);
                            setIsOpen(false);
                        }}
                        variant="ghost"
                    >
                        Import
                    </Button>
                </Styled.Actions>
            </Dialog.Actions>
        </Dialog>
    );
};
