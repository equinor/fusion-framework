import { type ChangeEvent, useCallback, useEffect, useId, useMemo, useState } from 'react';

import { EMPTY, from, of } from 'rxjs';

import { useObservableState } from '@equinor/fusion-observable/react';

import { useFrameworkModule } from '@equinor/fusion-framework-react';
import type { AppModule } from '@equinor/fusion-framework-module-app';
import type { BookmarkUpdate } from '@equinor/fusion-framework-module-bookmark';

import { Button, Checkbox, Dialog, Input, Label, TextField } from '@equinor/eds-core-react';
import styled from 'styled-components';

import { useBookmarkComponentContext } from '../BookmarkProvider';

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
  const { provider, addBookmarkToClipboard, currentApp } = useBookmarkComponentContext();

  const [state, setState] = useState<BookmarkUpdate>({
    name: '',
    description: '',
    isShared: false,
  });

  const nameId = useId();
  const descriptionId = useId();

  const [updatePayload, setUpdatePayload] = useState(false);

  const bookmark$ = useMemo(
    () => from(provider ? provider.getBookmark(bookmarkId) : EMPTY),
    [provider, bookmarkId],
  );

  const { value: bookmark, complete: isLoadingBookmark } = useObservableState(bookmark$);

  // set the state when the bookmark is loaded
  useEffect(() => {
    if (bookmark) {
      const { name, description, isShared } = bookmark;
      setState({ name, description, isShared });
    }
  }, [bookmark]);

  // TODO - this should be on the bookmark object
  const appProvider = useFrameworkModule<AppModule>('app');
  const { value: appName } = useObservableState(
    useMemo(
      () => (bookmark && appProvider ? appProvider.getAppManifest(bookmark.appKey) : of(undefined)),
      [appProvider, bookmark],
    ),
  );

  const updateBookmark = useCallback(
    async (updates: BookmarkUpdate) => {
      if (!provider) {
        console.error('Provider not available');
        return;
      }
      from(
        provider.updateBookmark(bookmarkId, updates, {
          excludePayloadGeneration: !updatePayload,
        }),
      ).subscribe({
        next: (updatedBookmark) => {
          console.debug('Bookmark updated', updatedBookmark);
        },
        error: (error) => {
          console.error('Failed to update bookmark', error);
        },
        complete: () => {
          onClose(false);
        },
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
          <Label htmlFor={nameId} label="Name" />
          <Input
            id={nameId}
            autoComplete="off"
            value={state?.name}
            onChange={(event: ChangeEvent<HTMLInputElement>) => {
              setState((s) => ({ ...s, name: event.target.value }));
            }}
          />
        </div>
        <div>
          <TextField
            id={descriptionId}
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
          <Input readOnly={true} value={appName?.displayName || ''} />
        </div>

        <Styled.CheckboxWrapper>
          <Checkbox
            label="Is Shared"
            checked={state.isShared}
            onChange={(changeEvent: ChangeEvent<HTMLInputElement>) => {
              const isShared = changeEvent.target.checked;
              if (isShared) {
                addBookmarkToClipboard(bookmarkId);
              }
              setState((s) => ({ ...s, isShared }));
            }}
          />
          {/* only allow updating payload if the app is the same as the creator of the app */}
          {bookmark?.appKey === currentApp?.name && provider?.canCreateBookmarks && (
            <Checkbox
              label="Update bookmark with current view"
              checked={updatePayload}
              onChange={() => {
                setUpdatePayload((s) => !s);
              }}
            />
          )}
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
