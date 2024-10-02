import { useState } from 'react';
import { ContextSelector } from './ContextSelector';
import { FusionLogo } from './FusionLogo';

/* typescript reference for makeStyles */
import '@material-ui/styles';

import { styled } from 'styled-components';
import { add, menu, tag } from '@equinor/eds-icons';
import { Button, Icon, TopBar } from '@equinor/eds-core-react';
Icon.add({ menu, add, tag });

import { useCurrentUser } from '@equinor/fusion-framework-react/hooks';
import { BookmarkModule } from '@equinor/fusion-framework-react-module-bookmark';
import { BookmarkProvider } from '@equinor/fusion-framework-react-components-bookmark';

import PersonAvatarElement from '@equinor/fusion-wc-person/avatar';
PersonAvatarElement;

import { BookmarkSideSheet } from './BookMarkSideSheet';
import { PersonSideSheet } from './PersonSideSheet';
import { useCurrentAppModule } from '@equinor/fusion-framework-react/app';

const Styled = {
    Title: styled.div`
        display: flex;
        align-items: center;
        gap: 0.75rem;
        font-size: 1rem;
        font-weight: 500;
    `,
};

export const Header = () => {
    const [isPersonSheetOpen, setIsPersonSheetOpen] = useState(false);
    const [isBookmarkOpen, setIsBookmarkOpen] = useState(false);
    const currentUser = useCurrentUser();

    const { localAccountId: azureId } = currentUser ?? {};

    function toggleBookmark() {
        setIsBookmarkOpen((s) => !s);
    }

    const { module: bookmarkProvider } = useCurrentAppModule<BookmarkModule>('bookmark');

    return (
        <>
            <TopBar id="cli-top-bar" sticky={false} style={{ padding: '0 1em', height: 48 }}>
                <TopBar.Header>
                    <Styled.Title>
                        <FusionLogo />
                        <span>Fusion Framework CLI</span>
                    </Styled.Title>
                </TopBar.Header>
                <TopBar.CustomContent>
                    <ContextSelector />
                </TopBar.CustomContent>
                {/* since buttons are 40px but have 48px click bounds */}
                <TopBar.Actions style={{ minWidth: 48, minHeight: 48 }}>
                    <Button
                        onClick={toggleBookmark}
                        variant="ghost_icon"
                        disabled={!bookmarkProvider}
                        title={
                            bookmarkProvider
                                ? 'Bookmarks'
                                : 'Bookmarks not available, enable in app'
                        }
                    >
                        <Icon name="tag" />
                    </Button>
                    <Button
                        onClick={() => setIsPersonSheetOpen(!isPersonSheetOpen)}
                        variant="ghost_icon"
                    >
                        <fwc-person-avatar
                            size="small"
                            azureId={azureId}
                            clickable={false}
                        ></fwc-person-avatar>
                    </Button>
                </TopBar.Actions>
            </TopBar>
            <BookmarkProvider provider={bookmarkProvider}>
                <BookmarkSideSheet isOpen={isBookmarkOpen} onClose={toggleBookmark} />
            </BookmarkProvider>
            <PersonSideSheet
                azureId={azureId}
                isOpen={isPersonSheetOpen}
                onClose={() => setIsPersonSheetOpen(!isPersonSheetOpen)}
            />
        </>
    );
};

export default Header;
