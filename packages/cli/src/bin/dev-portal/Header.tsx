import { useState } from 'react';
import { ContextSelector } from './ContextSelector';
import { FusionLogo } from './FusionLogo';

/* typescript reference for makeStyles */
import '@material-ui/styles';
import { BookmarkSideSheet } from './BookMarkSideSheet';
import { Button, Icon, TopBar } from '@equinor/eds-core-react';
import { BookmarkProvider } from '@equinor/fusion-framework-react-components-bookmark';
import { add, menu, tag } from '@equinor/eds-icons';
import { styled } from 'styled-components';

import { PersonSideSheet } from './PersonSideSheet';
import { PersonAvatarElement } from '@equinor/fusion-wc-person';
PersonAvatarElement;

Icon.add({ menu, add, tag });

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
    const [isPersonOpen, setIsPersonOpen] = useState(false);
    const [isBookmarkOpen, setIsBookmarkOpen] = useState(false);

    function toggleBookmark() {
        setIsBookmarkOpen((s) => !s);
    }

    return (
        <>
            <TopBar id="cli-top-bar" sticky={false} style={{ padding: 0, height: 48 }}>
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
                    <Button onClick={toggleBookmark} variant="ghost_icon">
                        <Icon name="tag" />
                    </Button>
                    <Button onClick={() => setIsPersonOpen(!isPersonOpen)} variant="ghost_icon">
                        <fwc-person-avatar
                            azureId="49132c24-6ea4-41fe-8221-112f314573f0"
                            clickable={false}
                            disabled={true}
                            size="small"
                        ></fwc-person-avatar>
                    </Button>
                </TopBar.Actions>
            </TopBar>
            <BookmarkProvider>
                <BookmarkSideSheet isOpen={isBookmarkOpen} onClose={toggleBookmark} />
            </BookmarkProvider>
            <PersonSideSheet isOpen={isPersonOpen} onClose={() => setIsPersonOpen(!isPersonOpen)} />
        </>
    );
};

export default Header;
