export { Router } from './Router.js';
export { routerContext } from './context.js';
export { FusionRouterContextProvider } from './fusion-router-context-provider.js';
export { useRouterContext } from './use-router-context.js';
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
  BrowserRouter,
  Form,
  Link,
  NavLink,
  Navigate,
  Outlet,
  createSearchParams,
  generatePath,
  isRouteErrorResponse,
  matchPath,
  matchRoutes,
  redirect,
  type LinkProps,
  type PathParam,
  type SetURLSearchParams,
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
