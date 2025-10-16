import { Outlet, type RouteObject } from 'react-router-dom';
import Navigation from './components/Navigation';
import { BarChart } from './pages/BarChart';
import { LineChart } from './pages/LineChart';
import HomePage from './pages/HomePage';
import { AgArea, AgBar, AgLine, AgPie } from './pages/ag-charts';

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
      {
        path: 'ag-chart',
        children: [
          {
            path: 'bar',
            Component: AgBar,
          },
          {
            path: 'pie',
            Component: AgPie,
          },
          {
            path: 'line',
            Component: AgLine,
          },
          {
            path: 'area',
            Component: AgArea,
          },
        ],
      },
    ],
  },
];

export default routes;
