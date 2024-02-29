import { RouteObject } from 'react-router-dom';
import { Navigation } from './pages/Navigation';
import { AvatarPage } from './pages/AvatarPage';
import { CardPage } from './pages/CardPage';
import { ListItemPage } from './pages/ListItemPage';
import { HomePage } from './pages/HomePage';
import { SelectorPage } from './pages/SelectorPage';

export const routes: RouteObject[] = [
    {
        path: '/',
        Component: Navigation,
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
