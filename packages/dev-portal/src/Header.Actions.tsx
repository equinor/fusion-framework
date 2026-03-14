import { tag } from '@equinor/eds-icons';
import { Button, Icon, TopBar } from '@equinor/eds-core-react';

import PersonAvatarElement from '@equinor/fusion-wc-person/avatar';
PersonAvatarElement;

import { useBookmarkComponentContext } from '@equinor/fusion-framework-react-components-bookmark';

/** Props for the {@link HeaderActions} component. */
interface HeaderActionProps {
  /** Azure AD object ID of the current user, used for the person avatar. */
  readonly userAzureId?: string;
  /** Toggle callback for the bookmark side sheet open/close state. */
  readonly toggleBookmark: (open: (status: boolean) => boolean) => void;
  /** Toggle callback for the person settings side sheet open/close state. */
  readonly togglePerson: (open: (status: boolean) => boolean) => void;
}

/**
 * Action buttons displayed in the portal top bar header.
 *
 * Renders a bookmark toggle button (disabled when no bookmark provider is
 * available) and a person-avatar button that opens the user settings sheet.
 *
 * @param props - {@link HeaderActionProps}
 */
export const HeaderActions = (props: HeaderActionProps) => {
  const { toggleBookmark, togglePerson, userAzureId } = props;

  const bookmarkContext = useBookmarkComponentContext();

  return (
    <TopBar.Actions style={{ minWidth: 48, minHeight: 48 }}>
      <Button
        onClick={() => toggleBookmark((x) => !x)}
        variant="ghost_icon"
        disabled={!bookmarkContext.provider}
        title={bookmarkContext.provider ? 'Bookmarks' : 'Bookmarks not available, enable in app'}
      >
        <Icon data={tag} />
      </Button>
      <Button onClick={() => togglePerson((x) => !x)} variant="ghost_icon">
        <fwc-person-avatar size="small" azureId={userAzureId} clickable={false} />
      </Button>
    </TopBar.Actions>
  );
};
