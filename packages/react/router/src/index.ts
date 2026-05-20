import { Route as ReactRouterRoute, Routes as ReactRouterRoutes } from 'react-router';

export { Router } from './Router.js';
export { FusionRouterContextProvider, routerContext, useRouterContext } from './context.js';
export type { RouteSchemaEntry } from './routes/to-route-schema.js';
export type {
  ActionFunction,
  ActionFunctionArgs,
  ErrorElement,
  ErrorElementProps,
  FusionRouterContext,
  LoaderFunction,
  LoaderFunctionArgs,
  RouteComponentProps,
  RouteNode,
  RouteObject,
  RouterComponent,
  RouterContext,
  RouterHandle,
  RouterSchema,
} from './types.js';

// Re-export commonly used React Router hooks, components, and utilities
// so consumers don't need to install or import `react-router` directly.
export {
  Form,
  Link,
  NavLink,
  Navigate,
  Outlet,
  matchPath,
  matchRoutes,
  redirect,
  type LinkProps,
  useActionData,
  useFormAction,
  useLocation,
  useLoaderData,
  useMatch,
  useMatches,
  useNavigate,
  useNavigation,
  useOutlet,
  useOutletContext,
  useParams,
  useResolvedPath,
  useRouteError,
  useSearchParams,
  useSubmit,
} from 'react-router';

/**
 * Use Fusion route schema DSL or RouteObject-based routing instead of React Router `<Routes>`.
 * @deprecated Please use Fusion DSL or RouteObject instead.
 */
export const Routes: typeof ReactRouterRoutes = ReactRouterRoutes;

/**
 * Use Fusion route schema DSL or RouteObject-based routing instead of React Router `<Route>`.
 * @deprecated Please use Fusion DSL or RouteObject instead.
 */
export const Route: typeof ReactRouterRoute = ReactRouterRoute;
