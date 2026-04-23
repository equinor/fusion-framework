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
