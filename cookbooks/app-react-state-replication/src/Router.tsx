import { RouterProvider, type RouteObject } from 'react-router-dom';
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

export default function () {
  const router = useRouter(routes as any[]);
  return <RouterProvider router={router as any} />;
}
