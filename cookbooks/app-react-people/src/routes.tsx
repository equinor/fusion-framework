import { Link, Outlet, RouteObject } from 'react-router-dom';
import { AvatarPage } from './pages/AvatarPage';
import { CardPage } from './pages/CardPage';
import { ListItemPage } from './pages/ListItemPage';
import { HomePage } from './pages/HomePage';
import { SelectorPage } from './pages/SelectorPage';

export const routes: RouteObject[] = [
    {
        path: '/',
        element: (
            <div>
                <section style={{ display: 'inline-flex', gap: 10 }}>
                    <Link to={''}>Home</Link>
                    <Link to={'avatar'}>Avatar</Link>
                    <Link to={'card'}>Card</Link>
                    <Link to={'list-item'}>List item</Link>
                    <Link to={'selector'}>Selector</Link>
                </section>
                <Outlet></Outlet>
            </div>
        ),
        children: [
            {
                index: true,
                Component: HomePage,
            },
            {
                path: 'avatar/*',
                Component: AvatarPage,
            },
            {
                path: 'card/*',
                Component: CardPage,
            },
            {
                path: 'list-item/*',
                Component: ListItemPage,
            },
            {
                path: 'selector/*',
                Component: SelectorPage,
            },
        ],
    },
];

export default routes;
