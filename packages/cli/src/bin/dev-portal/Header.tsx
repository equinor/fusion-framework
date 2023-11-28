import { useEffect, useMemo, useState } from 'react';
import { ContextSelector } from './ContextSelector';
import { FusionLogo } from './FusionLogo';

import { useFramework } from '@equinor/fusion-framework-react';
import { IHttpClient } from '@equinor/fusion-framework-module-http';
import { Query } from '@equinor/fusion-query';

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
    const [httpClient, setHttpClient] = useState<IHttpClient | null>(null);
    const [azureId, setAzureId] = useState<string | null>(null);

    const framework = useFramework();
    function toggleBookmark() {
        setIsBookmarkOpen((s) => !s);
    }

    const togglePersonSideSheet = () => {
        setIsPersonOpen(!isPersonOpen);
    };

    useEffect(() => {
        if (!httpClient) {
            framework.modules.serviceDiscovery
                .createClient('people')
                .then((http) => setHttpClient(http));
        }
    }, [framework.modules.serviceDiscovery, httpClient]);

    useMemo(async () => {
        if (httpClient) {
            const queryMe = new Query({
                queueOperator: 'merge',
                key: () => '',
                client: {
                    fn: () => {
                        return httpClient.json<{ azureUniqueId: string }>(
                            `/persons/me?api-version=4.0`,
                        );
                    },
                },
            });
            const me = await queryMe.queryAsync('').then((x) => x.value);
            if (me) {
                setAzureId(me.azureUniqueId);
            }
        }
    }, [httpClient]);

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
                    {azureId && (
                        <Button onClick={togglePersonSideSheet} variant="ghost_icon">
                            <fwc-person-avatar
                                azureId={azureId}
                                clickable={false}
                                size="small"
                            ></fwc-person-avatar>
                        </Button>
                    )}
                </TopBar.Actions>
            </TopBar>
            <BookmarkProvider>
                <BookmarkSideSheet isOpen={isBookmarkOpen} onClose={toggleBookmark} />
            </BookmarkProvider>
            {azureId && (
                <PersonSideSheet
                    isOpen={isPersonOpen}
                    onClose={togglePersonSideSheet}
                    azureId={azureId}
                />
            )}
        </>
    );
};

export default Header;
