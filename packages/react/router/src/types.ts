import type {
  RouteObject as ReactRouterRouteObject,
  RouterContextProvider as ReactRouterContextProvider,
} from 'react-router';
import type { Modules, ModulesInstanceType } from '@equinor/fusion-framework-react-module';
import type { MiddlewareFunction } from './middleware.js';

/**
 * Utility type representing a value that may be synchronous or asynchronous.
 *
 * Used by loader and action function signatures to allow both sync and async implementations.
 *
 * @template T - The type of the resolved value.
 */
export type MaybePromise<T> = T | Promise<T>;
/**
 * Dynamic route parameters parsed from the URL path segments.
 *
 * Maps parameter names (e.g. `id` from `:id`) to their string values.
 *
 * @template Key - Union of allowed parameter names. Defaults to `string`.
 */
export type UrlParameters<Key extends string = string> = {
  readonly [key in Key]: string | undefined;
};

/**
 * Base context interface for router context.
 * Consumers can extend this interface via module augmentation to add custom context properties.
 *
 * @example
 * ```typescript
 * declare module '@equinor/fusion-framework-react-router' {
 *   interface RouterContext {
 *     queryClient?: QueryClient;
 *     api?: MyApi;
 *   }
 * }
 * ```
 */
// biome-ignore lint/suspicious/noEmptyInterface: required by react-router for module augmentation
export interface RouterContext {}

/**
 * Context object that provides Fusion Framework modules and custom context to route loaders, actions, and components.
 *
 * @template TContext - The type of custom context (extends RouterContext)
 * @template TModules - The type of Fusion Framework modules
 */
export interface FusionRouterContext<
  TContext extends RouterContext = RouterContext,
  TModules extends Modules = Modules,
> {
  /** Fusion Framework modules instance */
  modules: ModulesInstanceType<TModules>;
  /** Custom context object passed to the Router component */
  context: TContext;
}

/**
 * Per-execution React Router context provider passed to middleware, loaders and actions.
 *
 * This is React Router v8's own `Readonly<RouterContextProvider>`, the same type upstream uses
 * for Data Mode `context`, so values written by middleware with `context.set(key, value)` are read
 * with `context.get(key)` in loaders and actions of the same execution. Create keys with
 * `createContext<T>()`.
 */
export type RouteContextProvider = Readonly<ReactRouterContextProvider>;

/**
 * Arguments passed to data loading functions (loaders and actions).
 *
 * Mirrors React Router v8's Data Mode handler arguments (`request`, `url`, `pattern`, `params`,
 * `context`) and adds `fusion`. Because every upstream property is present, loaders and actions
 * typed with React Router's own argument types remain assignable to Fusion routes.
 *
 * @template TParams - The type of route parameters
 * @template TContext - The type of Fusion router context
 */
export type DataFunctionArgs<
  TParams extends UrlParameters,
  TContext extends FusionRouterContext = FusionRouterContext,
> = {
  /** A {@link https://developer.mozilla.org/en-US/docs/Web/API/Request Fetch Request instance} which you can use to read headers (like cookies, and {@link https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams URLSearchParams} from the request. */
  request: Request;
  /** URL of the location being navigated to or fetched. */
  url: URL;
  /** Matched route pattern, for example `/projects/:projectId`. */
  pattern: string;
  /**
   * Per-execution context provider. Middleware of the same execution can `set` typed values
   * that the handler reads with `get`; values are never shared between executions.
   */
  context: RouteContextProvider;
  /**
   * {@link https://reactrouter.com/start/framework/routing#dynamic-segments Dynamic route params} for the current route.
   * @example
   * // app/routes.ts
   * route("teams/:teamId", "./team.tsx"),
   *
   * // app/team.tsx
   * export function loader({
   *   params,
   * }: Route.LoaderArgs) {
   *   params.teamId;
   *   //        ^ string
   * }
   */
  params: TParams;
  /** Fusion Framework context containing modules and custom context */
  fusion: TContext;
};

/**
 * Return type for data loading functions (loaders and actions).
 * Can be any value that will be serialized and passed to route components.
 */
export type DataFunctionValue = unknown;

/**
 * Arguments passed to route loader functions.
 * Loaders run before rendering route components to fetch data.
 *
 * @template TParams - The type of route parameters
 * @template TContext - The type of Fusion router context
 */
export interface LoaderFunctionArgs<
  TParams extends UrlParameters = UrlParameters,
  TContext extends FusionRouterContext = FusionRouterContext,
> extends DataFunctionArgs<TParams, TContext> {}

/**
 * Function type for route loaders.
 * Loaders are executed before rendering route components to fetch data.
 *
 * @template TParams - The type of route parameters
 * @template TContext - The type of Fusion router context
 */
export type LoaderFunction<
  TParams extends UrlParameters = UrlParameters,
  TContext extends FusionRouterContext = FusionRouterContext,
> = (args: LoaderFunctionArgs<TParams, TContext>) => MaybePromise<DataFunctionValue>;

/**
 * Arguments passed to route action functions.
 * Actions handle form submissions and mutations.
 *
 * @template TParams - The type of route parameters
 * @template TContext - The type of Fusion router context
 */
export interface ActionFunctionArgs<
  TParams extends UrlParameters = UrlParameters,
  TContext extends FusionRouterContext = FusionRouterContext,
> extends DataFunctionArgs<TParams, TContext> {}

/**
 * Function type for route actions.
 * Actions handle form submissions and mutations.
 *
 * @template TParams - The type of route parameters
 * @template TContext - The type of Fusion router context
 */
export type ActionFunction<
  TParams extends UrlParameters = UrlParameters,
  TContext extends FusionRouterContext = FusionRouterContext,
> = (args: ActionFunctionArgs<TParams, TContext>) => MaybePromise<DataFunctionValue>;

/**
 * Props passed to route component functions.
 *
 * @template TData - The type of data returned from the loader
 * @template TActionData - The type of data returned from the action
 * @template TContext - The type of Fusion router context
 */
export interface RouteComponentProps<
  TData = unknown,
  TActionData = unknown,
  TContext extends FusionRouterContext = FusionRouterContext,
> {
  /** Data returned from the route loader */
  loaderData: TData;
  /** Data returned from the route action */
  actionData: TActionData;
  /** Fusion Framework context containing modules and custom context */
  fusion: TContext;
}

/**
 * Component type for route components.
 * Route components receive loader data, action data, and Fusion context as props.
 *
 * @template TData - The type of data returned from the loader
 * @template TContext - The type of Fusion router context
 */
export type RouterComponent<
  TData = unknown,
  TContext extends FusionRouterContext = FusionRouterContext,
> = React.ComponentType<RouteComponentProps<TData, TContext>>;

/**
 * Props passed to error boundary components.
 *
 * @template TError - The type of error that occurred
 * @template TContext - The type of Fusion router context
 */
export interface ErrorElementProps<
  TError = unknown,
  TContext extends FusionRouterContext = FusionRouterContext,
> {
  /** The error that triggered the error boundary */
  error: TError;
  /** Fusion Framework context containing modules and custom context */
  fusion: TContext;
}

/**
 * Component type for error boundary components.
 * Error boundaries catch and display errors that occur during route rendering or data loading.
 *
 * @template TError - The type of error that occurred
 * @template TContext - The type of Fusion router context
 */
export type ErrorElement<
  TError = unknown,
  TContext extends FusionRouterContext = FusionRouterContext,
> = React.ComponentType<ErrorElementProps<TError, TContext>>;

/**
 * Schema definition for route parameters.
 * Supports type validation and enum constraints.
 */
export interface ParamsSchema {
  /** Description of the parameter */
  [id: string]: string;
}

/**
 * Schema definition for search/query parameters.
 * Supports type validation and enum constraints.
 */
export interface SearchSchema {
  /** Description of the search parameter */
  [id: string]: string;
}

/**
 * Schema definition for a route including metadata, parameter schemas, and search schemas.
 * Stored in the `handle` field of React Router's RouteObject.
 */
export interface RouterSchema {
  description?: string;
  /** Parameter schemas for dynamic route segments */
  params?: ParamsSchema;
  /** Search parameter schemas for query string parameters */
  search?: SearchSchema;
}

/**
 * Handle object for route metadata.
 * Consumers can extend this interface via module augmentation to add custom properties.
 *
 * @example
 * ```typescript
 * declare module '@equinor/fusion-framework-react-router' {
 *   interface RouterHandle {
 *     customProperty?: string;
 *     permissions?: string[];
 *   }
 * }
 * ```
 */
export interface RouterHandle {
  route: RouterSchema;
  [key: string]: unknown;
}

/**
 * Extended React Router RouteObject with Fusion Framework handle support.
 *
 * **`errorElement` diverges from React Router**: React Router accepts a `ReactNode`
 * (a rendered element), but Fusion requires a `ComponentType` so it can inject
 * `error` and `fusion` context as props at render time. Pass the component
 * class/function directly — do **not** wrap it in JSX.
 *
 * ```tsx
 * // Correct (component reference):
 * { errorElement: MyErrorPage }
 *
 * // Wrong (rendered element — will fail at runtime):
 * { errorElement: <MyErrorPage /> }
 * ```
 *
 * `ErrorBoundary` works exactly as in React Router (a `ComponentType` that may
 * additionally receive `error` and `fusion` props from the Fusion router).
 */
export type RouteObject = Omit<
  ReactRouterRouteObject,
  'handle' | 'children' | 'errorElement' | 'middleware' | 'lazy' | 'loader' | 'action'
> & {
  /**
   * Route loader. The Fusion router calls it with React Router's arguments plus `fusion`.
   * Loaders typed with React Router's own `LoaderFunction` remain assignable. The boolean form
   * is React Router's and is passed through unchanged.
   */
  loader?: LoaderFunction | Extract<ReactRouterRouteObject['loader'], boolean>;
  /**
   * Route action. The Fusion router calls it with React Router's arguments plus `fusion`.
   * Actions typed with React Router's own `ActionFunction` remain assignable. The boolean form
   * is React Router's and is passed through unchanged.
   */
  action?: ActionFunction | Extract<ReactRouterRouteObject['action'], boolean>;
  /** Route metadata handle containing schema and custom properties */
  handle?: RouterHandle;
  /**
   * Client Data Mode middleware for this route, run outer route first and in array order
   * before matched loaders and actions. The Fusion router injects `fusion` into each call.
   * Route modules expose this as their `middleware` export.
   */
  middleware?: MiddlewareFunction[];
  /**
   * Lazily loaded route properties. Identical to React Router's `lazy`, except that a lazy
   * `middleware` property resolves Fusion {@link MiddlewareFunction}s.
   */
  lazy?: RouteObjectLazy;
  /** Child routes */
  children?: RouteObject[];
  /**
   * Component rendered when this route throws. The Fusion router injects
   * `error` and `fusion` as props.
   *
   * **Note**: Unlike React Router, this must be a `ComponentType`, not a `ReactNode`.
   * Mutually exclusive with `ErrorBoundary`.
   */
  errorElement?: ErrorElement;
};

/** React Router's `lazy` definition: either a lazy function or an object of lazy properties. */
type ReactRouterLazy = NonNullable<ReactRouterRouteObject['lazy']>;

/** Object form of React Router's `lazy`, where each route property is loaded on its own. */
type ReactRouterLazyObject = Exclude<ReactRouterLazy, (...args: never[]) => unknown>;

/**
 * `lazy` definition accepted by Fusion route objects.
 *
 * The function form is unchanged from React Router (it cannot return `middleware`). The object
 * form may lazily load Fusion {@link MiddlewareFunction}s; React Router loads lazy middleware for
 * every matched route before it runs the middleware chain, so unrelated route chunks stay lazy.
 */
export type RouteObjectLazy =
  | Exclude<ReactRouterLazy, ReactRouterLazyObject>
  | (Omit<ReactRouterLazyObject, 'middleware'> & {
      middleware?: () => Promise<MiddlewareFunction[] | null | undefined>;
    });

/**
 * Type of route node in the route definition DSL.
 *
 * - `'route'` – A standard route with a path and optional children.
 * - `'index'` – An index (default) route that renders at the parent’s path.
 * - `'layout'` – A layout route that wraps children with a shared component.
 * - `'prefix'` – A path-only grouping node that prepends a segment to children.
 */
export type RouteKind = 'route' | 'index' | 'layout' | 'prefix';

/**
 * Base interface for route definition nodes in the DSL.
 *
 * Concrete implementations (`IndexRoute`, `Route`, `LayoutRoute`, `PrefixRoute`)
 * extend this interface and are converted to React Router `RouteObject`s by the
 * `<Router>` component or the Vite plugin.
 */
export interface RouteNode {
  /** The kind of route node. */
  kind: RouteKind;
}

/**
 * Route node that references a file containing the route’s component module.
 *
 * File-based routes support lazy loading and automatic code splitting when
 * used with the Vite plugin.
 */
export interface RouteFileNode extends RouteNode {
  /** Relative file path (e.g. `'./pages/Home.tsx'`) to the route component module. */
  file: string;
}

/**
 * Module augmentation for React Router's RouterContext.
 * Extends React Router's context type to include Fusion Framework context.
 */
declare module 'react-router' {
  interface RouterContext extends FusionRouterContext {}
}
