import { useState, useRef } from 'react';
import { ThemeProvider, theme } from '@equinor/fusion-react-styles';
import { ContextSelector } from './ContextSelector';
import { FusionLogo } from './FusionLogo';

/* typescript reference for makeStyles */
import '@material-ui/styles';
import { BookmarkSideSheet } from './BookMarkSideSheet';
import { Button, Icon, TopBar, Typography } from '@equinor/eds-core-react';
import { BookmarkProvider } from '@equinor/fusion-framework-react-components-bookmark';
import { add, menu, tag } from '@equinor/eds-icons';
import styled from '@emotion/styled';
import { css } from '@emotion/css';

Icon.add({ menu, add, tag });

const StyledHeader = styled(TopBar.Header)`
    width: max-content;
`;

const StyledTopBar = styled(TopBar)`
    padding: 0px;
    height: 48px;
`;

const StyledCustomContent = styled(TopBar.CustomContent)`
    display: flex;
    align-items: center;
`;

const StyledActionsWrapper = styled(TopBar.Actions)`
    padding-right: 0.5rem;
`;
const StyledTitle = styled(Typography)`
    padding-left: 0.5rem;
    white-space: nowrap;
`;

const styles = {
    logoWrapper: css`
        display: flex;
        flex-direction: row;
        align-items: center;
    `,
    contextSelector: css`
        width: 100%;
        max-width: 420px;
        margin-left: 1em;
    `,
};

export const Header = () => {
    const buttonRef = useRef(null);
    const [open, setOpen] = useState(false);

    const [isBookmarkOpen, setIsBookmarkOpen] = useState(false);

    function toggleBookmark() {
        setIsBookmarkOpen((s) => !s);
    }

    return (
        <ThemeProvider theme={theme}>
            <StyledTopBar>
                <StyledHeader>
                    <Button ref={buttonRef} onClick={() => setOpen(!open)} variant="ghost_icon">
                        <Icon name="menu" />
                    </Button>
                    <div className={styles.logoWrapper}>
                        <FusionLogo scale={0.7} />
                        <StyledTitle variant="h6">Fusion CLI</StyledTitle>
                    </div>
                </StyledHeader>
                <StyledCustomContent>
                    <div className={styles.contextSelector}>
                        <ContextSelector />
                    </div>
                </StyledCustomContent>

                <StyledActionsWrapper>
                    <Button onClick={toggleBookmark} variant="ghost_icon">
                        <Icon name="tag" />
                    </Button>
                </StyledActionsWrapper>
            </StyledTopBar>
            <BookmarkProvider>
                <BookmarkSideSheet isOpen={isBookmarkOpen} onClose={toggleBookmark} />
            </BookmarkProvider>
        </ThemeProvider>
    );
};

export default Header;
