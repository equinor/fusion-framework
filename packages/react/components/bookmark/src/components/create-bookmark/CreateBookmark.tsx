import { ChangeEvent, useCallback, useEffect, useState } from 'react';

import { BookmarkCreateArgs } from '@equinor/fusion-framework-module-bookmark';
import { useBookmarkComponentContext } from '../BookmarkProvider';

import { Button, Checkbox, Dialog, Input, Label, TextField } from '@equinor/eds-core-react';
import styled from 'styled-components';
import { from } from 'rxjs';

// TODO
const StyledContent = styled(Dialog.Content)`
    display: flex;
    flex-direction: column;
    gap: 1rem;
`;

export const CreateBookmarkModal = ({
    isOpen,
    onClose,
}: {
    readonly isOpen: boolean;
    readonly onClose: (b: boolean) => void;
}) => {
    const { provider, currentApp } = useBookmarkComponentContext();

    const [state, setState] = useState<BookmarkCreateArgs<never>>({
        name: '',
        description: '',
        isShared: false,
    });

    useEffect(() => {
        setState((s) => ({ ...s, appKey: currentApp?.appKey || '' }));
    }, [currentApp]);

    const createBookmark = useCallback(
        async (args: BookmarkCreateArgs<never>) => {
            // TODO: Show success message
            // TODO: should this call onCreated, with the new bookmark?
            // TODO: should current bookmark be updated?
            const sub = from(provider.createBookmark(args)).subscribe({
                next: (bookmark) => {
                    console.log('Bookmark created', bookmark);
                },
                error: (error) => {
                    console.error('Failed to create bookmark', error);
                },
                complete() {
                    onClose(false);
                },
            });
            return () => sub.unsubscribe();
        },
        [onClose, provider],
    );

    return (
        <Dialog style={{ width: '400px' }} open={isOpen}>
            <Dialog.Header>Create bookmark</Dialog.Header>
            <StyledContent>
                <div>
                    <Label htmlFor="name" label="Name" />
                    <Input
                        id="name"
                        autoComplete="off"
                        value={state?.name}
                        onChange={(event: ChangeEvent<HTMLInputElement>) => {
                            setState((s) => ({ ...s, name: event.target.value }));
                        }}
                    />
                </div>
                <div>
                    <TextField
                        id="storybook-multiline-three"
                        label="Description"
                        multiline
                        rows={3}
                        rowsMax={10}
                        onChange={(event: ChangeEvent<HTMLInputElement>) => {
                            setState((s) => ({ ...s, description: event.target.value }));
                        }}
                    />
                </div>
                <div>
                    <Label htmlFor="app" label="App" />
                    <Input readOnly={true} value={currentApp?.name || currentApp?.appKey || ''} />
                </div>

                <div>
                    <Checkbox
                        label="Is Shared"
                        checked={state.isShared}
                        onChange={(event: ChangeEvent<HTMLInputElement>) => {
                            setState((s) => ({ ...s, isShared: event.target.checked }));
                        }}
                    />
                </div>
            </StyledContent>
            <Dialog.Actions>
                <div style={{ display: 'flex', gap: '0.2em' }}>
                    <Button onClick={() => onClose(false)} variant="ghost">
                        Cancel
                    </Button>
                    <Button
                        disabled={!currentApp || !state.name}
                        onClick={() => {
                            createBookmark(state);
                        }}
                    >
                        Create
                    </Button>
                </div>
            </Dialog.Actions>
        </Dialog>
    );
};
