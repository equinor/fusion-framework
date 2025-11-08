import { Link, Outlet, type RouteObject } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { useNavigationModule } from '@equinor/fusion-framework-react-app/navigation';

const Root = () => {
  const currentLocation = useLocation();
  const navigation = useNavigationModule();

  return (
    <div>
      <section style={{ display: 'inline-flex', gap: 10, alignItems: 'center' }}>
        <Link to={''}>Home</Link>
        <Link to={'page1'} state={{ test: 'test1' }}>Page 1</Link>
        <Link to={'page2'} state={{ test: 'test2' }}>Page 2</Link>
      </section>
      <h3>React Router Location</h3>
      <pre>{JSON.stringify(currentLocation, null, 4)}</pre>
      <h3>Navigation Provider State</h3>
      <pre>{JSON.stringify(navigation.history.location, null, 4)}</pre>
      <Outlet />
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
