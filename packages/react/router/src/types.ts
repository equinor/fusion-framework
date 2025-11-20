import type { RouteObject as ReactRouterRouteObject } from 'react-router';
import type { LazyLoaderOptions, StaticImportFunction } from './routes/create-lazy-loader.js';
import type { Modules, ModulesInstanceType } from '@equinor/fusion-framework-react-module';

/**
 * Utility type representing a value that may be synchronous or asynchronous.
 * @template T - The type of the value
 */
export type MaybePromise<T> = T | Promise<T>;
/**
 * The parameters that were parsed from the URL path.
 */
export type Params<Key extends string = string> = {
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
 * Arguments passed to data loading functions (loaders and actions).
 *
 * @template TParams - The type of route parameters
 * @template TContext - The type of Fusion router context
 */
export type DataFunctionArgs<
  TParams extends Params,
  TContext extends FusionRouterContext = FusionRouterContext,
> = {
  /** A {@link https://developer.mozilla.org/en-US/docs/Web/API/Request Fetch Request instance} which you can use to read headers (like cookies, and {@link https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams URLSearchParams} from the request. */
  request: Request;
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
  TParams extends Params = Params,
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
  TParams extends Params = Params,
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
  TParams extends Params = Params,
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
  TParams extends Params = Params,
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
  TError = Error,
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
  TError = Error,
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
 * Adds support for RouterHandle in the handle field and typed children.
 */
export type RouteObject = ReactRouterRouteObject & {
  /** Route metadata handle containing schema and custom properties */
  handle?: RouterHandle;
  /** Child routes */
  children?: RouteObject[];
};

/**
 * Type of route node in the route definition DSL.
 */
export type RouteKind = 'route' | 'index' | 'layout' | 'prefix';

/**
 * Base interface for route definition nodes.
 * Route nodes are converted to React Router RouteObjects via the `toRouteObject` method.
 */
export interface RouteNode {
  /** The kind of route node */
  kind: RouteKind;
  /**
   * Converts this route node to React Router RouteObject(s).
   * @param options - Options for lazy loading and context injection
   * @returns One or more RouteObjects for React Router
   */
  toRouteObject(options?: LazyLoaderOptions): RouteObject | RouteObject[];
}

/**
 * Route node that references a file containing the route component.
 * File-based routes support lazy loading and automatic code splitting.
 */
export interface RouteFileNode extends RouteNode {
  /** File path or import function for the route component module */
  file: string | StaticImportFunction;
}

/**
 * Module augmentation for React Router's RouterContext.
 * Extends React Router's context type to include Fusion Framework context.
 */
declare module 'react-router' {
  interface RouterContext extends FusionRouterContext {}
}
