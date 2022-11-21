import { createBrowserRouter, Outlet, RouterProvider, useParams } from 'react-router-dom';
import AppLoader from './AppLoader';
import ContextSelector from './ContextSelector';

const Root = () => {
    return (
        <div style={{ fontFamily: 'Equinor' }}>
            <Outlet />
            <ContextSelector />
        </div>
    );
};

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

export const Router = () => <RouterProvider router={router} fallbackElement={<p>wooot</p>} />;
