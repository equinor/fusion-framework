import { Page1 } from './Page1';
import { Page2 } from './Page2';
import { Link, Outlet } from 'react-router-dom';
import { Create } from './Create';

export const routes = [
    {
        path: '/',
        element: (
            <div>
                <section style={{ display: 'inline-flex', gap: 10 }}>
                    <Link to={''}>Create Bookmark</Link>
                    <Link to={'page1'}>Page 1</Link>
                    <Link to={'page2'}>Page 2</Link>
                </section>
                <Outlet />
            </div>
        ),
        children: [
            {
                index: true,
                element: <Create />,
            },
            {
                path: 'page1/*',
                element: <Page1 />,
            },
            {
                path: 'page2/*',
                element: <Page2 />,
            },
        ],
    },
];

export default routes;
