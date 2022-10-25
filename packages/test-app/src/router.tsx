import { createBrowserRouter, Outlet, Link } from 'react-router-dom';

import { Main } from './pages/Main';
import { AppList } from './pages/AppList';
import GetBookmark from './pages/service-bookmarks/GetBookmark';
import GetContext from './pages/context/GetContext';
import QueryContext from './pages/context/QueryContext';
import ServiceGetContext from './pages/service-context/GetContext';
import ServiceQueryContext from './pages/service-context/QueryContext';

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
                            <Link to="/context/get">context/get</Link>
                        </li>
                        <li>
                            <Link to="/context/query">context/query</Link>
                        </li>
                        <li>
                            <Link to="/service/context/get">service/context/get</Link>
                        </li>
                        <li>
                            <Link to="/service/context/query">service/context/query</Link>
                        </li>
                        <li>
                            <Link to="/service/bookmarks/get">service/bookmarks/get</Link>
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
                path: '/context/get',
                element: <GetContext />,
            },
            {
                path: '/context/query',
                element: <QueryContext />,
            },
            {
                path: '/service/context/get',
                element: <ServiceGetContext />,
            },
            {
                path: '/service/context/query',
                element: <ServiceQueryContext />,
            },
            {
                path: '/service/bookmarks/get',
                element: <GetBookmark />,
            },
        ],
    },
]);

export default router;
