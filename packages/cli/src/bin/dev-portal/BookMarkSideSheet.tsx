import { Button, Icon } from '@equinor/eds-core-react';
import { useFramework } from '@equinor/fusion-framework-react';
import { Bookmark } from '@equinor/fusion-framework-react-components-bookmark';
import { BookmarkModule } from '@equinor/fusion-framework-react-module-bookmark';
import { useCurrentAppModule } from '@equinor/fusion-framework-react/app';
import { SideSheet } from '@equinor/fusion-react-side-sheet';

type BookmarkSideSheetProps = {
    readonly isOpen: boolean;
    onClose(): void;
};

export const BookmarkSideSheet = ({ isOpen, onClose }: BookmarkSideSheetProps) => {
    const { module: bookmarkProvider } = useCurrentAppModule<BookmarkModule>('bookmark');

    const { event } = useFramework().modules;

    return (
        <SideSheet isOpen={isOpen} onClose={onClose} isDismissable={true} enableFullscreen={true}>
            <SideSheet.Indicator color={'#258800'} />
            <SideSheet.Title title="Bookmarks" />
            <SideSheet.SubTitle subTitle={'Application bookmarks'} />
            <SideSheet.Actions>
                <Button
                    disabled={!bookmarkProvider?.hasBookmarkCreators}
                    variant="ghost"
                    onClick={() => {
                        onClose();
                        event.dispatchEvent('onBookmarkOpen', { detail: true });
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
