import { useBookmarkNavigate } from '@equinor/fusion-framework-react-module-bookmark/portal';

import { Outlet, RouterProvider, RouterProviderProps, useParams } from 'react-router-dom';
import AppLoader from './AppLoader';
import Header from './Header';

import { PersonProvider } from '@equinor/fusion-react-person';
import { usePersonResolver } from './usePersonResolver';
import { useFramework } from '@equinor/fusion-framework-react';
import { NavigationModule } from '@equinor/fusion-framework-module-navigation';
import { useState } from 'react';

const Root = () => {
    const personResolver = usePersonResolver();

    useBookmarkNavigate({ resolveAppPath: (appKey: string) => `/apps/${appKey}` });

    return (
        <div style={{ fontFamily: 'Equinor', height: "100%" }}>
            <PersonProvider resolve={personResolver}>
                <Header />
                <Outlet />
            </PersonProvider>
        </div>
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
            {
                path: 'apps/test',
                element: <p>Bookmark Test Route ok</p>,
            },
            {
                path: 'test',
                element: <p>ok</p>,
            },
        ],
    },
];

// eslint-disable-next-line react/no-multi-comp
export const Router = () => {
    const { navigation } = useFramework<[NavigationModule]>().modules;
    const [router] = useState(() => navigation.createRouter(routes));
    return (
        <RouterProvider
            router={router as unknown as RouterProviderProps['router']}
            fallbackElement={<p>wooot</p>}
        />
    );
};
