import { layout, index, route, prefix } from '@equinor/fusion-framework-react-router/routes';

export const routes = layout('./pages/Root.tsx', [
  index('./pages/HomePage.tsx'),
  route('bar-chart/*', './pages/BarChart.tsx'),
  route('line-chart/*', './pages/LineChart.tsx'),
  prefix('ag-chart', [
    route('bar', './pages/ag-charts/AgBar.tsx'),
    route('pie', './pages/ag-charts/AgPie.tsx'),
    route('line', './pages/ag-charts/AgLine.tsx'),
    route('area', './pages/ag-charts/AgArea.tsx'),
  ]),
]);

export default routes;
