import { useBookmarkNavigate } from '@equinor/fusion-framework-react-module-bookmark/portal';

import { Outlet, RouterProvider, RouterProviderProps, useParams } from 'react-router-dom';
import AppLoader from './AppLoader';
import Header from './Header';

import { useFramework } from '@equinor/fusion-framework-react';
import { NavigationModule } from '@equinor/fusion-framework-module-navigation';
import { useState } from 'react';
import { styled } from 'styled-components';
import { useAppContextNavigation } from './useAppContextNavigation';

const Styled = {
    ContentContainer: styled.div`
        display: grid;
        grid-template-columns: 1fr;
        grid-template-rows: 48px 1fr;
        height: 100vh;
        overflow: hidden;
        grid-template-areas: 'head' 'main';
    `,
    Head: styled.section`
        grid-area: head;
    `,
    Main: styled.section`
        grid-area: main;
        overflow: hidden;
    `,
};

const Root = () => {
    useBookmarkNavigate({ resolveAppPath: (appKey: string) => `/apps/${appKey}` });
    return (
        <Styled.ContentContainer>
            <Styled.Head>
                <Header />
            </Styled.Head>
            <Styled.Main>
                <Outlet />
            </Styled.Main>
        </Styled.ContentContainer>
    );
};

// eslint-disable-next-line react/no-multi-comp
const AppRoute = () => {
    const { appKey } = useParams();
    return appKey ? <AppLoader appKey={appKey} /> : null;
};

const routes = [
    {
        path: '/',
        element: <Root />,
        children: [
            {
                path: 'apps/:appKey/*',
                element: <AppRoute />,
            },
        ],
    },
];

// eslint-disable-next-line react/no-multi-comp
export const Router = () => {
    const { navigation } = useFramework<[NavigationModule]>().modules;
    const [router] = useState(() => navigation.createRouter(routes));
    // observe the context changes and navigate when the context changes
    useAppContextNavigation();
    return (
        <RouterProvider
            router={router as unknown as RouterProviderProps['router']}
            fallbackElement={<p>wooot</p>}
        />
    );
};
