import { RouterProvider } from '@equinor/fusion-framework-react-router/interop';
import type { RouteObject } from '@equinor/fusion-framework-react-router';
import { useRouter } from '@equinor/fusion-framework-react-app/navigation';

import { Home, Profile, Root, Todo } from './pages';

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
  const router = useRouter(routes);
  return <RouterProvider router={router} />;
}
