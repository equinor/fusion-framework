import { useCallback, useState } from 'react';
import { ContextSelector } from './ContextSelector';
import { FusionLogo } from './FusionLogo';

/* typescript reference for makeStyles */
import '@material-ui/styles';

import { styled } from 'styled-components';
import { add, menu, tag } from '@equinor/eds-icons';
import { Icon, TopBar } from '@equinor/eds-core-react';
Icon.add({ menu, add, tag });

import { useCurrentUser } from '@equinor/fusion-framework-react/hooks';
import { useCurrentApp, useCurrentAppModule } from '@equinor/fusion-framework-react/app';

import { type BookmarkModule } from '@equinor/fusion-framework-react-module-bookmark';

import { BookmarkProvider } from '@equinor/fusion-framework-react-components-bookmark';

import PersonAvatarElement from '@equinor/fusion-wc-person/avatar';
PersonAvatarElement;

import { PersonSideSheet } from './PersonSideSheet';

import { BookmarkSideSheet } from './BookMarkSideSheet';

import { HeaderActions } from './Header.Actions';

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
    const currentUser = useCurrentUser();
    const [isPersonSheetOpen, setIsPersonSheetOpen] = useState(false);

    const [isBookmarkOpen, setIsBookmarkOpen] = useState(false);
    const onBookmarkClose = useCallback(() => {
        setIsBookmarkOpen(false);
    }, []);

    const { currentApp } = useCurrentApp();

    const { module: bookmarkProvider } = useCurrentAppModule<BookmarkModule>('bookmark');

    return (
        <BookmarkProvider
            provider={bookmarkProvider ?? undefined}
            currentApp={
                currentApp
                    ? { appKey: currentApp.appKey, name: currentApp.manifest?.displayName }
                    : undefined
            }
            currentUser={
                currentUser ? { id: currentUser.localAccountId, name: currentUser.name } : undefined
            }
        >
            <TopBar id="cli-top-bar" sticky={false} style={{ padding: '0 1em', height: 48 }}>
                <TopBar.Header>
                    <Styled.Title>
                        <FusionLogo />
                        <span>Fusion Framework CLI</span>
                    </Styled.Title>
                </TopBar.Header>
                <HeaderActions
                    userAzureId={currentUser?.localAccountId}
                    toggleBookmark={setIsBookmarkOpen}
                    togglePerson={setIsPersonSheetOpen}
                />
                <TopBar.CustomContent>
                    <ContextSelector />
                </TopBar.CustomContent>
                {/* since buttons are 40px but have 48px click bounds */}
            </TopBar>
            <BookmarkSideSheet isOpen={isBookmarkOpen} onClose={onBookmarkClose} />
            <PersonSideSheet
                azureId={currentUser?.localAccountId}
                isOpen={isPersonSheetOpen}
                onClose={() => setIsPersonSheetOpen(!isPersonSheetOpen)}
            />
        </BookmarkProvider>
    );
};
