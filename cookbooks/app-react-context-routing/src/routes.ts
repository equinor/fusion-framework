import { index, layout, route } from '@equinor/fusion-framework-react-router/routes';

const routes = layout('./pages/Layout.tsx', [
  index('./pages/HomePage.tsx'),
  route('route-a', './pages/RouteAPage.tsx'),
  route('route-b', './pages/RouteBPage.tsx'),
  route(':contextId', './pages/HomePage.tsx'),
  route(':contextId/route-a', './pages/RouteAPage.tsx'),
  route(':contextId/route-b', './pages/RouteBPage.tsx'),
  route('route-a/:contextId', './pages/RouteAPage.tsx'),
  route('route-b/:contextId', './pages/RouteBPage.tsx'),
]);

export default routes;
