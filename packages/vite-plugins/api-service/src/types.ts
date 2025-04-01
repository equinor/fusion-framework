import type { IncomingMessage, ServerResponse } from 'node:http';

import type { ConfigEnv, Connect, ProxyOptions, UserConfig } from 'vite';

import type ProxyServer from 'http-proxy';
import type { Matcher } from './create-route-matcher.js';

/**
 * Represents a subset of the `Console` interface, providing methods for logging at various levels.
 *
 * This type includes the following methods:
 * - `debug`: For detailed debugging information.
 * - `log`: For general informational messages.
 * - `warn`: For warnings that indicate potential issues.
 * - `error`: For error messages indicating failures.
 *
 * Use this type to define a logger that adheres to these specific logging methods.
 */
export type PluginLogger = Pick<Console, 'debug' | 'info' | 'warn' | 'error'>;

/**
 * Represents JSON data which can be of various types including:
 */
export type JsonData = Record<string, unknown> | Array<unknown> | string | number | boolean | null;

/**
 * Represents the HTTP methods that can be proxied by the API service.
 *
 * @remarks
 * This type includes the standard HTTP methods commonly used in RESTful APIs:
 * - `GET`: Retrieve data from the server.
 * - `POST`: Submit data to the server to create a resource.
 * - `PUT`: Update an existing resource or create a new one if it does not exist.
 * - `DELETE`: Remove a resource from the server.
 * - `PATCH`: Apply partial modifications to a resource.
 * - `HEAD`: Retrieve metadata about a resource without fetching its body.
 * - `OPTIONS`: Describe the communication options for the target resource.
 */
export type ProxyMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';

export type NextFunction = Connect.NextFunction;

/**
 * Represents a mapping of request parameter names to their corresponding string values.
 *
 * This type is commonly used to define query parameters or path parameters
 * in an API request.
 */
export type RequestParams = Record<string, string>;

/**
 * Represents an incoming HTTP request, extending the `IncomingMessage` interface
 * with optional route parameters.
 *
 * @template IncomingMessage - The base HTTP incoming message.
 * @property params - An optional object containing route parameters extracted
 *                    from the request URL.
 */
export type IncomingRequest = Connect.IncomingMessage & { params?: RequestParams };

/**
 * Represents a server listener function that handles incoming requests.
 *
 * @param req - The incoming request object.
 * @param res - The server response object.
 * @param next - A callback function to pass control to the next middleware.
 */
export type ServerListener = (
  req: IncomingRequest,
  res: ServerResponse,
  next: NextFunction,
) => void;

/**
 * A type representing a listener function for proxy events.
 *
 * This function is invoked when a proxy response is received. It provides
 * access to the proxy response, the original request, and the server response.
 *
 * @param proxyRes - The response received from the proxy server.
 * @param req - The original incoming HTTP request from the client.
 * @param res - The HTTP response object that will be sent back to the client.
 */
export type ProxyListener = (
  proxyRes: IncomingMessage,
  req: IncomingRequest,
  res: ServerResponse,
) => void;

/**
 * Represents a handler for proxying API requests.
 */
export interface ApiProxyHandler {
  /**
   * The routing path managed by this handler.
   */
  readonly route: string;

  /**
   * The list of API routes managed by this handler.
   */
  readonly routes: ApiRoute[];

  /**
   * Generates the proxy options based on the provided user configuration and environment.
   *
   * @param config - Vite configuration.
   * @param env - Vite environment.
   */
  createProxyOptions: (config: UserConfig, env: ConfigEnv) => ProxyOptions;
}

/**
 * Options for configuring an API route proxy.
 *
 * @see ProxyServer.ServerOptions
 *
 * @property target - The target URL for the proxy server.
 * @property configure - A function to configure the proxy server instance.
 *                     It receives the proxy server instance  and a record of additional options.
 * @property rewrite - A function to rewrite the request path.
 *                     It takes the original path as input and returns the rewritten path.
 * @property transformResponse - A function to transform the response data.
 *                      It takes the original response data as input and returns the transformed data.
 */
export type ApiRouteProxyOptions = Omit<ProxyServer.ServerOptions, 'target'> & {
  target: string;
  configure?: (proxy: ProxyServer, options: Record<string, unknown>) => void;
  rewrite?: (path: string) => string;
  transformResponse?: (data: JsonData) => JsonData;
};

type RouteMatcher = string | Matcher;

/**
 * Represents a middleware route configuration.
 *
 * @property match - A function or pattern used to determine if the route matches a request.
 * @property middleware - The server listener function to handle requests matching the route.
 * @property proxy - An optional property that must always be `never` for middleware routes.
 */
export type MiddlewareRoute = {
  match: RouteMatcher;
  middleware: ServerListener;
  proxy?: never;
};

/**
 * Represents a proxy route configuration for an API service.
 *
 * @property match - A `RouteMatcher` instance used to determine if the route matches a specific request.
 * @property middleware - Must always be `never` for this type, indicating that middleware is not allowed.
 * @property proxy - Configuration options for the API route proxy, defined by `ApiRouteProxyOptions`.
 */
export type ProxyRoute = {
  match: RouteMatcher;
  middleware?: never;
  proxy: ApiRouteProxyOptions;
};

export type ApiRoute = MiddlewareRoute | ProxyRoute;
