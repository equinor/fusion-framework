import { Button, Checkbox, Dialog, Input, Label, TextField } from '@equinor/eds-core-react';
import type { AppModule } from '@equinor/fusion-framework-module-app';
import { useFramework } from '@equinor/fusion-framework-react';
import { useBookmark } from '@equinor/fusion-framework-react-module-bookmark';
import { ChangeEvent, useState } from 'react';

import styled from 'styled-components';
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
    const [state, setState] = useState<{ name: string; description: string; isShared: boolean }>({
        name: '',
        description: '',
        isShared: false,
    });

    const { current } = useFramework<[AppModule]>().modules.app;

    const { createBookmark } = useBookmark();

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
                    <Input readOnly={true} value={current?.manifest?.name || ''} />
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
                        onClick={() => {
                            state &&
                                createBookmark(state).then(() => {
                                    onClose(false);
                                });
                        }}
                    >
                        Create
                    </Button>
                </div>
            </Dialog.Actions>
        </Dialog>
    );
};
