import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AppRoute } from './components/AppRoute';
import { Root } from './components/Root';

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
