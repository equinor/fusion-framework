import { Outlet, type RouteObject } from 'react-router-dom';
import Navigation from './components/Navigation';
import { BarChart } from './pages/BarChart';
import { LineChart } from './pages/LineChart';
import HomePage from './pages/HomePage';

const Root = () => {
  return (
    <div style={{ display: 'flex', gap: 20 }}>
      <Navigation />
      <div style={{ flexGrow: 1 }}>
        <Outlet />
      </div>
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
        Component: HomePage,
      },
      {
        path: 'bar-chart/*',
        Component: BarChart,
      },
      {
        path: 'line-chart/*',
        Component: LineChart,
      },
    ],
  },
];

export default routes;
