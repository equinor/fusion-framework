export { Router } from './Router.js';
export { routerContext, useRouterContext, FusionRouterContextProvider } from './context.js';
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
  RouterComponent,
  RouterContext,
  RouterHandle,
  RouterSchema,
  RouteNode,
  RouteObject,
} from './types.js';

// Re-export commonly used React Router hooks, components, and utilities
// so consumers don't need to install or import `react-router` directly.
export {
  Form,
  Link,
  type LinkProps,
  NavLink,
  Navigate,
  Outlet,
  redirect,
  RouterProvider,
  useActionData,
  useFormAction,
  useLoaderData,
  useLocation,
  useMatch,
  useMatches,
  useNavigate,
  useNavigation,
  useParams,
  useRouteError,
  useSearchParams,
  useSubmit,
} from 'react-router';
