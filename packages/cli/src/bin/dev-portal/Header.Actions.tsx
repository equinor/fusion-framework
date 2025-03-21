import { tag } from '@equinor/eds-icons';
import { Button, Icon, TopBar } from '@equinor/eds-core-react';

import PersonAvatarElement from '@equinor/fusion-wc-person/avatar';
PersonAvatarElement;

import { useBookmarkComponentContext } from '@equinor/fusion-framework-react-components-bookmark';

interface HeaderActionProps {
  readonly userAzureId?: string;
  readonly toggleBookmark: (open: (status: boolean) => boolean) => void;
  readonly togglePerson: (open: (status: boolean) => boolean) => void;
}

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
