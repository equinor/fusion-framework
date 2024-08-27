import { ChangeEvent, useCallback, useEffect, useMemo, useState } from 'react';

import { map, of } from 'rxjs';

import { useObservableState } from '@equinor/fusion-observable/react';

import { useFramework, useFrameworkModule } from '@equinor/fusion-framework-react';
import type { AppModule } from '@equinor/fusion-framework-module-app';
import type { BookmarkUpdate } from '@equinor/fusion-framework-module-bookmark';

import { Button, Checkbox, Dialog, Input, Label, TextField } from '@equinor/eds-core-react';
import styled from 'styled-components';

import { useBookmarkComponentContext } from '../BookmarkProvider';
import { appendBookmarkIdToUrl } from '../../utils/append-bookmark-to-uri';

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
    readonly bookmarkId: string;
}) => {
    const { provider } = useBookmarkComponentContext();

    const [state, setState] = useState<BookmarkUpdate>({
        name: '',
        description: '',
        isShared: false,
    });

    const [updatePayload, setUpdatePayload] = useState(false);

    const { event } = useFramework<[AppModule]>().modules;

    const bookmark$ = useMemo(
        () => provider.getBookmark(bookmarkId, { excludePayload: true }),
        [provider, bookmarkId],
    );

    const { value: bookmark, complete: isLoadingBookmark } = useObservableState(bookmark$);

    // set the state when the bookmark is loaded
    useEffect(() => {
        if (bookmark) {
            setState({
                name: bookmark.name,
                description: bookmark.description,
                isShared: bookmark.isShared,
            });
        }
    }, [bookmark]);

    // TODO - this should be on the bookmark object
    const appProvider = useFrameworkModule<AppModule>('app');
    const { value: appName } = useObservableState(
        useMemo(
            () =>
                bookmark && appProvider
                    ? appProvider.appClient
                          .query({ appKey: bookmark.appKey })
                          .pipe(map((x) => x.value.name))
                    : of(undefined),
            [appProvider, bookmark],
        ),
    );

    const updateBookmark = useCallback(
        async (updates: BookmarkUpdate) => {
            await provider.updateBookmarkAsync(bookmarkId, updates, {
                excludePayloadGeneration: !updatePayload,
            });
            // TODO: Show success message
            // TODO: should this call onUpdated, with the updated bookmark?
            onClose(false);
        },
        [onClose, provider, bookmarkId, updatePayload],
    );

    // TODO - add loading spinner
    isLoadingBookmark;

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
                    {/** TODO - show ghost while loading app name  */}
                    <Input readOnly={true} value={appName || ''} />
                </div>

                <Styled.CheckboxWrapper>
                    <Checkbox
                        label="Is Shared"
                        checked={state.isShared}
                        onChange={(changeEvent: ChangeEvent<HTMLInputElement>) => {
                            if (changeEvent.target.checked) {
                                const url = appendBookmarkIdToUrl(bookmark?.id || '');
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
                            updateBookmark(state);
                        }}
                    >
                        Save
                    </Button>
                </Styled.Actions>
            </Dialog.Actions>
        </Styled.Dialog>
    );
};
