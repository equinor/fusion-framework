import { useState, useRef } from 'react';
import { makeStyles, createStyles, clsx, ThemeProvider, theme } from '@equinor/fusion-react-styles';
import { ContextSelector } from './ContextSelector';
import { FusionLogo } from './FusionLogo';
import { Button } from '@equinor/fusion-react-button';
import { Icon } from '@equinor/fusion-react-icon';

/* typescript reference for makeStyles */
import '@material-ui/styles';
import { useHasBookmark } from '@equinor/fusion-framework-react-module-bookmark/portal';

const useStyles = makeStyles(
    createStyles({
        header: {
            padding: '0 1em',
        },
        center: {
            display: 'flex',
            justifyContent: 'flex-start',
            alignItems: 'center',
        },
        wrapper: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
        },
        contextselector: {
            width: '100%',
            maxWidth: '420px',
            marginLeft: '1em',
        },
    }),
    { name: 'contextselector-styles' }
);

export const Header = () => {
    const styles = useStyles();
    const buttonRef = useRef(null);
    const [open, setOpen] = useState(false);

    const hasBookmark = useHasBookmark();

    return (
        <ThemeProvider theme={theme}>
            <header className={clsx(styles.header, styles.wrapper)}>
                <div className={clsx(styles.center)}>
                    <Button ref={buttonRef} onClick={() => setOpen(!open)} variant="ghost">
                        <Icon icon="menu" />
                    </Button>
                    <FusionLogo scale={0.7} />
                    <div className={clsx(styles.contextselector)}>
                        <ContextSelector />
                    </div>
                </div>
                <div>
                    {hasBookmark && (
                        <Button
                            ref={buttonRef}
                            onClick={() => console.info('Bookmark is enabled!')}
                            variant="ghost"
                        >
                            <Icon icon="tag" />
                        </Button>
                    )}
                </div>
            </header>
        </ThemeProvider>
    );
};

export default Header;
