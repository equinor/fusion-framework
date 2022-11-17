import { NavigationModule } from '@equinor/fusion-framework-module-navigation';
import { useAppModule } from '@equinor/fusion-framework-react-app';
import { Outlet, Link, RouteObject, RouterProvider } from 'react-router-dom';

export const routes: RouteObject[] = [
    {
        path: '/',
        element: (
            <div>
                <section style={{ display: 'inline-flex', gap: 10 }}>
                    <Link to={''}>Home</Link>
                    <Link to={'page1'}>Page 1</Link>
                    <Link to={'page2'}>Page 2</Link>
                </section>
                <Outlet></Outlet>
            </div>
        ),
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

export const AppRouter = () => {
    const module = useAppModule<NavigationModule>('navigation');
    const router = module.createRouter(routes);
    return <RouterProvider router={router} fallbackElement={<p>:(</p>} />;
};

export default AppRouter;
