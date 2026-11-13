import { Button, Icon } from '@equinor/eds-core-react';
import { Bookmark } from '@equinor/fusion-framework-react-components-bookmark';
import { useBookmarkComponentContext } from '@equinor/fusion-framework-react-components-bookmark';
import { type HEXString, SideSheet } from '@equinor/fusion-react-side-sheet';

// The Indicator prop is typed as a hex string but is interpolated into CSS, so an EDS variable works.
const indicatorColor = 'var(--eds-color-bg-success-fill-emphasis-default)' as HEXString;

/** Props for the {@link BookmarkSideSheet} component. */
type BookmarkSideSheetProps = {
  /** Whether the side sheet is currently visible. */
  readonly isOpen: boolean;
  /** Callback invoked when the user dismisses the side sheet. */
  readonly onClose: VoidFunction;
};

/**
 * Side sheet overlay for browsing and creating application bookmarks.
 *
 * Wraps the `Bookmark` component from `@equinor/fusion-framework-react-components-bookmark`
 * in a dismissible side sheet with an "Add Bookmark" action button.
 *
 * @param props - {@link BookmarkSideSheetProps}
 */
export const BookmarkSideSheet = ({ isOpen, onClose }: BookmarkSideSheetProps) => {
  const { provider, showCreateBookmark } = useBookmarkComponentContext();

  return (
    <SideSheet isOpen={isOpen} onClose={onClose} isDismissable={true} enableFullscreen={true}>
      <SideSheet.Indicator color={indicatorColor} />
      <SideSheet.Title title="Bookmarks" />
      <SideSheet.SubTitle subTitle={'Application bookmarks'} />
      <SideSheet.Actions>
        <Button
          disabled={!provider?.canCreateBookmarks}
          variant="ghost"
          onClick={() => {
            showCreateBookmark();
            onClose();
          }}
        >
          <Icon name="add" /> Add Bookmark
        </Button>
      </SideSheet.Actions>
      <SideSheet.Content>
        <Bookmark />
      </SideSheet.Content>
    </SideSheet>
  );
};
