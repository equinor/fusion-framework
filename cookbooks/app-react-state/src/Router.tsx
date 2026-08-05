import { Router as FusionRouter, type RouteObject } from '@equinor/fusion-framework-react-router';

import { Basics, Home, Profile, Root, Todo } from './pages';

const routes: RouteObject[] = [
  {
    path: '/',
    element: <Root />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: 'basics/*',
        element: <Basics />,
      },
      {
        path: 'profile/*',
        element: <Profile />,
      },
      {
        path: 'todos/*',
        element: <Todo />,
      },
    ],
  },
];

/** Renders the application's route tree via the Fusion navigation module. */
export default function Router() {
  return <FusionRouter routes={routes} />;
}
