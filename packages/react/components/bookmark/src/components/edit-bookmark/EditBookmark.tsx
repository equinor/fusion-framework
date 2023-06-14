import { css } from '@emotion/css';
import styled from '@emotion/styled';
import { Button, Checkbox, Dialog, Input, Label, TextField } from '@equinor/eds-core-react';
import type { AppModule } from '@equinor/fusion-framework-module-app';
// TODO - export from `@equinor/fusion-framework-react-module-bookmark`
import type { PatchBookmark } from '@equinor/fusion-framework-module-bookmark';
import { useFramework } from '@equinor/fusion-framework-react';
import { useBookmark } from '@equinor/fusion-framework-react-module-bookmark';
import { ChangeEvent, useEffect, useState } from 'react';
import { appendBookmarkIdToUrl } from '../../utils/append-bookmark-to-uri';

const StyledContent = styled(Dialog.Content)`
    display: flex;
    flex-direction: column;
    gap: 1rem;
`;
const StyledDialog = styled(Dialog)`
    width: 500px;
`;

const styles = {
    checkboxWrapper: css`
        display: flex;
        gap: 1rem;
    `,
    actions: css`
        display: 'flex';
        gap: 0.2em;
    `,
};

export const EditBookmarkModal = ({
    isOpen,
    onClose,
    bookmarkId,
}: {
    isOpen: boolean;
    onClose: (b: boolean) => void;
    bookmarkId?: string;
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
        <StyledDialog open={isOpen}>
            <Dialog.Header>Edit bookmark</Dialog.Header>
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

                <div className={styles.checkboxWrapper}>
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
                </div>
            </StyledContent>
            <Dialog.Actions>
                <div className={styles.actions}>
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
                </div>
            </Dialog.Actions>
        </StyledDialog>
    );
};
