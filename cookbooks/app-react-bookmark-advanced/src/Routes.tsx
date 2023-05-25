import { Page1 } from './Page1';
import { Page2 } from './Page2';
import { Link, Outlet, RouteObject } from 'react-router-dom';
import { Create } from './Create';
import { Provider } from './Provider';
import { BookmarkAppNavigation } from './BoomarkAppNavigation';
import Selected from './Selected';

export const routes: RouteObject[] = [
    {
        path: '/',
        element: (
            <Provider>
                <BookmarkAppNavigation>
                    <section style={{ display: 'inline-flex', gap: 10 }}>
                        <Link to={''}>Home</Link>
                        <Link to={'page1'}>Page 1</Link>
                        <Link to={'page2'}>Page 2</Link>
                    </section>

                    <Outlet />

                    <Create />
                </BookmarkAppNavigation>
            </Provider>
        ),
        children: [
            {
                index: true,
                element: (
                    <div>
                        <Selected />
                    </div>
                ),
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
