import { createBrowserRouter, Outlet, Link } from 'react-router-dom';

import { Main } from './pages/Main';
import { AppList } from './pages/AppList';
import GetContext from './pages/service-context/GetContext';
import QueryContext from './pages/service-context/QueryContext';

export const router = createBrowserRouter([
    {
        path: '/',
        element: (
            <div style={{ display: 'grid', gridTemplateColumns: '200px auto' }}>
                <div style={{ border: '1px solid #333', padding: 10 }}>
                    <ul>
                        <li>
                            <Link to="/">home</Link>
                        </li>
                        <li>
                            <Link to="/app-list">app list</Link>
                        </li>
                        <li>
                            <Link to="/service/context/get">service/context/get</Link>
                        </li>
                        <li>
                            <Link to="/service/context/query">service/context/query</Link>
                        </li>
                    </ul>
                </div>
                <div style={{ padding: 10 }}>
                    <Outlet />
                </div>
            </div>
        ),
        children: [
            { index: true, element: <Main /> },
            {
                path: '/app-list',
                element: <AppList />,
            },
            {
                path: '/service/context/get',
                element: <GetContext />,
            },
            {
                path: '/service/context/query',
                element: <QueryContext />,
            },
        ],
    },
]);

export default router;
