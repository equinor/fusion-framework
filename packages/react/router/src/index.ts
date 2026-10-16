export { Router } from './Router.js';
export { routerContext } from './router-context.js';
export { FusionRouterContextProvider } from './fusion-router-context-provider.js';
export { useRouterContext } from './useRouterContext.js';
export type { RouteSchemaEntry } from './routes/to-route-schema.js';
export type {
  MiddlewareFunction,
  MiddlewareFunctionArgs,
  MiddlewareNextFunction,
} from './middleware.js';
export { requireRoles } from './require-roles.js';
export { RequireRolesError, type RequireRolesErrorReason } from './RequireRolesError.js';
export {
  RequireRolesRecovery,
  type RequireRolesRecoveryInit,
  type RequireRolesRecoveryOperation,
  type RequireRolesRecoveryResult,
} from './RequireRolesRecovery.js';
export {
  useRequireRolesRecovery,
  type RequireRolesRecoveryState,
  type RequireRolesRecoveryStatus,
} from './useRequireRolesRecovery.js';
export type {
  RouteOperation,
  RouteOperationTarget,
  RouteRecoveryScope,
} from './RouteRecoveryScope.js';
export {
  getRouteMiddlewareMetadata,
  type CustomMiddlewareMetadata,
  type RequireRolesMode,
  type RequireRolesOptions,
  type RolesMiddlewareMetadata,
  type RouteMiddlewareMetadata,
} from './middleware-metadata/index.js';
export type {
  ActionFunction,
  ActionFunctionArgs,
  ErrorElement,
  ErrorElementProps,
  FusionRouterContext,
  LoaderFunction,
  LoaderFunctionArgs,
  RouteComponentProps,
  RouteContextProvider,
  RouteNode,
  RouteObject,
  RouteObjectLazy,
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
  // Typed per-execution context for passing middleware results to loaders and actions.
  RouterContextProvider,
  createContext,
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
  useBeforeUnload,
  useBlocker,
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
