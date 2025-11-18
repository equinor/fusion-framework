import { layout, index, route, prefix } from '@equinor/fusion-framework-react-router/routes';

export const routes = layout(import.meta.resolve('./pages/Root.tsx'), [
  index(import.meta.resolve('./pages/HomePage.tsx')),
  route('bar-chart/*', import.meta.resolve('./pages/BarChart.tsx')),
  route('line-chart/*', import.meta.resolve('./pages/LineChart.tsx')),
  prefix('ag-chart', [
    route('bar', import.meta.resolve('./pages/ag-charts/AgBar.tsx')),
    route('pie', import.meta.resolve('./pages/ag-charts/AgPie.tsx')),
    route('line', import.meta.resolve('./pages/ag-charts/AgLine.tsx')),
    route('area', import.meta.resolve('./pages/ag-charts/AgArea.tsx')),
  ]),
]);

export default routes;
