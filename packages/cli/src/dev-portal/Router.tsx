import { useFramework } from '@equinor/fusion-framework-react';
import { useEffect } from 'react';
import {
    createBrowserRouter,
    Outlet,
    RouterProvider,
    useNavigate,
    useParams,
} from 'react-router-dom';
import AppLoader from './AppLoader';
import Header from './Header';

import { PersonProvider } from '@equinor/fusion-react-person';
import { usePersonResolver } from './usePersonResolver';

const Root = () => {
    const personResolver = usePersonResolver();
    const { modules } = useFramework();
    const navigate = useNavigate();

    useEffect(() => {
        const unSub = modules.event.addEventListener('onNavigateToApp', (e) => {
            navigate(e.detail.pathname + e.detail.search);
        });
        return unSub;
    }, []);

    return (
        <div style={{ fontFamily: 'Equinor' }}>
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

const router = createBrowserRouter([
    {
        path: '/',
        element: <Root />,
        children: [
            {
                path: 'apps/:appKey/*',
                element: <AppRoute />,
            },
            {
                path: 'test',
                element: <p>ok</p>,
            },
        ],
    },
]);

// eslint-disable-next-line react/no-multi-comp
export const Router = () => <RouterProvider router={router} fallbackElement={<p>wooot</p>} />;
