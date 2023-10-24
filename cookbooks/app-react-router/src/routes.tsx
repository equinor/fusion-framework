import { Link, Outlet, RouteObject } from 'react-router-dom';

import { useLocation } from 'react-router-dom';

const Root = () => {
    const currentLocation = useLocation();
    return (
        <div>
            <section style={{ display: 'inline-flex', gap: 10 }}>
                <Link to={''}>Home</Link>
                <Link to={'page1'}>Page 1</Link>
                <Link to={'page2'}>Page 2</Link>
            </section>
            <pre>{JSON.stringify(currentLocation, null, 4)}</pre>
            <Outlet></Outlet>
        </div>
    );
};

export const routes: RouteObject[] = [
    {
        path: '/',
        element: <Root />,
        children: [
            {
                index: true,
                element: <p>home</p>,
            },
            {
                path: 'page1/*',
                element: <p>page1</p>,
            },
            {
                path: 'page2/*',
                element: <p>page2</p>,
            },
        ],
    },
];

export default routes;
