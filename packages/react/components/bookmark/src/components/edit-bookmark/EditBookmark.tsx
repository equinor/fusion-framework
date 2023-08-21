import { ChangeEvent, useEffect, useState } from 'react';

import { Button, Checkbox, Dialog, Input, Label, TextField } from '@equinor/eds-core-react';
import type { AppModule } from '@equinor/fusion-framework-module-app';
// TODO - export from `@equinor/fusion-framework-react-module-bookmark`
import type { PatchBookmark } from '@equinor/fusion-framework-module-bookmark';
import { useFramework } from '@equinor/fusion-framework-react';
import { useBookmark } from '@equinor/fusion-framework-react-module-bookmark';
import { appendBookmarkIdToUrl } from '../../utils/append-bookmark-to-uri';

import styled from 'styled-components';

const Styled = {
    Dialog: styled(Dialog)`
        width: 500px;
    `,
    DialogContent: styled(Dialog.Content)`
        display: flex;
        flex-direction: column;
        gap: 1rem;
    `,
    CheckboxWrapper: styled.div`
        display: flex;
        gap: 1rem;
    `,
    Actions: styled.div`
        display: flex;
        gap: 0.2em;
    `,
};

export const EditBookmarkModal = ({
    isOpen,
    onClose,
    bookmarkId,
}: {
    readonly isOpen: boolean;
    readonly onClose: (b: boolean) => void;
    readonly bookmarkId?: string;
}) => {
    const [state, setState] = useState<PatchBookmark>({
        id: '',
        appKey: '',
        name: '',
        description: '',
        isShared: false,
    });

    const [updatePayload, setUpdatePayload] = useState(false);

    const { app, event } = useFramework<[AppModule]>().modules;
    const { current } = app;

    const { updateBookmark, bookmarks } = useBookmark();

    useEffect(() => {
        const bookmark = bookmarks.find((b) => b.id === bookmarkId);
        if (bookmark) {
            setState(bookmark);
        }
    }, [bookmarkId, bookmarks]);

    return (
        <Styled.Dialog open={isOpen}>
            <Dialog.Header>Edit bookmark</Dialog.Header>
            <Styled.DialogContent>
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
                        value={state?.description}
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

                <Styled.CheckboxWrapper>
                    <Checkbox
                        label="Is Shared"
                        checked={state.isShared}
                        onChange={(changeEvent: ChangeEvent<HTMLInputElement>) => {
                            if (changeEvent.target.checked) {
                                const url = appendBookmarkIdToUrl(state.id);
                                navigator.clipboard.writeText(url);
                                event.dispatchEvent('onBookmarkUrlCopy', { detail: { url } });
                            }
                            setState((s) => ({ ...s, isShared: changeEvent.target.checked }));
                        }}
                    />
                    <Checkbox
                        label="Update bookmark with current view"
                        checked={updatePayload}
                        onChange={() => {
                            setUpdatePayload((s) => !s);
                        }}
                    />
                </Styled.CheckboxWrapper>
            </Styled.DialogContent>
            <Dialog.Actions>
                <Styled.Actions>
                    <Button onClick={() => onClose(false)} variant="ghost">
                        Cancel
                    </Button>
                    <Button
                        onClick={() => {
                            state &&
                                updateBookmark(state, { updatePayload }).then(() => {
                                    onClose(false);
                                });
                        }}
                    >
                        Save
                    </Button>
                </Styled.Actions>
            </Dialog.Actions>
        </Styled.Dialog>
    );
};
