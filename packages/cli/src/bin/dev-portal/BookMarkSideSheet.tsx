import { Button, Icon } from '@equinor/eds-core-react';
import { Bookmark } from '@equinor/fusion-framework-react-components-bookmark';
import { useBookmarkComponentContext } from '@equinor/fusion-framework-react-components-bookmark';
import { SideSheet } from '@equinor/fusion-react-side-sheet';

type BookmarkSideSheetProps = {
    readonly isOpen: boolean;
    readonly onClose: VoidFunction;
};

export const BookmarkSideSheet = ({ isOpen, onClose }: BookmarkSideSheetProps) => {
    const { provider, showCreateBookmark } = useBookmarkComponentContext();

    return (
        <SideSheet isOpen={isOpen} onClose={onClose} isDismissable={true} enableFullscreen={true}>
            <SideSheet.Indicator color={'#258800'} />
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
