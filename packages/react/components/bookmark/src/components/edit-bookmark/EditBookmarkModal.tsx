import { type ChangeEvent, useCallback, useEffect, useId, useMemo, useState } from 'react';

import { EMPTY, from, of } from 'rxjs';

import { useObservableState } from '@equinor/fusion-observable/react';

import { useFrameworkModule } from '@equinor/fusion-framework-react';
import type { AppModule } from '@equinor/fusion-framework-module-app';
import type { BookmarkUpdate } from '@equinor/fusion-framework-module-bookmark';

import { Button, Checkbox, Dialog, Input, Label, Textarea } from '@equinor/eds-core-react';
import styled from 'styled-components';

import { useBookmarkComponentContext } from '../BookmarkProvider';
import { AppNameField } from './AppNameField';

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

/**
 * Modal for editing an existing bookmark.
 *
 * @param props - The component's props
 * @param props.isOpen - Whether the modal is open
 * @param props.onClose - Callback invoked to close the modal
 * @param props.bookmarkId - The id of the bookmark to edit
 * @returns The edit bookmark modal
 */
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
  const appId = useId();

  const [updatePayload, setUpdatePayload] = useState(false);

  const bookmark$ = useMemo(
    () => from(provider ? provider.getBookmark(bookmarkId) : EMPTY),
    [provider, bookmarkId],
  );

  const { value: bookmark } = useObservableState(bookmark$);

  // set the state when the bookmark is loaded
  useEffect(() => {
    // Only populate local state once the bookmark has actually loaded
    if (bookmark) {
      const { name, description, isShared } = bookmark;
      setState({ name, description, isShared });
    }
  }, [bookmark]);

  // TODO(#5091): this should be on the bookmark object
  const appProvider = useFrameworkModule<AppModule>('app');
  const { value: appName, error: appNameError } = useObservableState(
    useMemo(
      () => (bookmark && appProvider ? appProvider.getAppManifest(bookmark.appKey) : of(undefined)),
      [appProvider, bookmark],
    ),
  );
  // Only report a pending manifest request; missing providers and failed requests are not loading.
  const isAppNameLoading = Boolean(
    bookmark && appProvider && appName === undefined && appNameError === null,
  );

  const updateBookmark = useCallback(
    async (updates: BookmarkUpdate) => {
      // Cannot update a bookmark without a provider to persist the change
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
      // TODO(#5089): Show success message
      // TODO(#5090): should this call onUpdated, with the updated bookmark?
      onClose(false);
    },
    [onClose, provider, bookmarkId, updatePayload],
  );

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
          <Textarea
            id={descriptionId}
            label="Description"
            value={state?.description}
            rows={3}
            rowsMax={10}
            onChange={(event: ChangeEvent<HTMLTextAreaElement>) => {
              setState((s) => ({ ...s, description: event.target.value }));
            }}
          />
        </div>
        <div>
          <Label htmlFor={appId} label="App" />
          <AppNameField
            id={appId}
            displayName={appName?.displayName}
            isLoading={isAppNameLoading}
          />
        </div>

        <Styled.CheckboxWrapper>
          <Checkbox
            label="Is Shared"
            checked={state.isShared}
            onChange={(changeEvent: ChangeEvent<HTMLInputElement>) => {
              const isShared = changeEvent.target.checked;
              // Copy the bookmark URL when the user shares it so it's easy to send along
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
