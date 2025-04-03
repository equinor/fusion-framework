import type ProxyServer from 'http-proxy';

import type {
  ApiRoute,
  JsonData,
  ApiProxyHandler,
  PluginLogger,
  IncomingRequest,
} from './types.js';
import { DEFAULT_VALUES } from './constants.js';
import { createResponseInterceptor } from './create-response-interceptor.js';

/**
 * A type representing a function that processes API response data and transforms it
 * into a new format along with associated API routes.
 *
 * @template TResponse - The type of the input JSON data received from the API.
 * @template TResult - The type of the transformed JSON data to be returned.
 *
 * @param data - The input JSON data of type `TResponse` to be processed.
 * @returns An object containing:
 * - `data`: The transformed JSON data of type `TResult`.
 * - `routes`: An array of `ApiRoute` objects associated with the processed data.
 */
export type ApiDataProcessor<
  TResponse extends JsonData = JsonData,
  TResult extends JsonData = TResponse,
> = (
  data: TResponse,
  proxyRoute: string,
) => {
  data: TResult;
  routes?: ApiRoute[];
};

/**
 * Creates a proxy handler for API services, allowing for route resolution and proxy configuration.
 *
 * @template TResponse - The type of the response data from the API.
 * @template TResult - The type of the processed result data. Defaults to `TResponse`.
 *
 * @param handle - A function that processes the API response and returns the processed data
 *                 along with updated API routes.
 * @param options - Optional configuration for the proxy handler.
 * @param options.proxy - Additional proxy options to customize the behavior of the proxy.
 * @param options.route - The base route for the proxy. Defaults to `'/@services'`.
 *
 * @returns An object implementing the `ApiProxyHandler` interface, which includes:
 * - `route`: The base route for the proxy.
 * - `createProxyOptions`: A function to generate proxy options, including default and custom configurations.
 * - `resolveRoute`: A function to resolve a route based on the current API routes.
 */
export function createProxyHandler<
  TResponse extends JsonData,
  TResult extends JsonData = TResponse,
>(
  target: string,
  generateRoutes: ApiDataProcessor<TResponse, TResult>,
  args?: {
    route?: string;
    apiRoute?: string;
    proxyOptions?: Omit<
      ApiProxyHandler['createProxyOptions'] | ReturnType<ApiProxyHandler['createProxyOptions']>,
      'target' | 'transformResponse' | 'selfHandleResponse'
    >;
    logger?: PluginLogger;
  },
): ApiProxyHandler {
  const {
    route = DEFAULT_VALUES.SERVICES_PATH,
    apiRoute = DEFAULT_VALUES.API_PATH,
    proxyOptions = {},
    logger,
  } = args ?? {};

  // Initialize routes - this will be updated on each response
  let apiRoutes: ApiRoute[] | undefined;
  return {
    get route() {
      return route;
    },
    get routes() {
      return apiRoutes || [];
    },
    createProxyOptions: (...args) => {
      // Resolve the provided options
      const providedOptions =
        typeof proxyOptions === 'function' ? proxyOptions(...args) : proxyOptions;

      // Configure the proxy server
      const configure = (proxyServer: ProxyServer) => {
        proxyServer.on(
          'proxyRes',
          createResponseInterceptor(
            (data: TResponse) => {
              const { data: transformedData, routes } = generateRoutes(data, apiRoute);
              apiRoutes = routes;
              return transformedData;
            },
            {
              logger,
            },
          ),
        );
        proxyServer.on('proxyReq', (proxyReq, req: IncomingRequest) => {
          // Set the original request URL
          logger?.info(
            `Proxying ${req.originalUrl} -> ${proxyReq.protocol}//${proxyReq.host}${proxyReq.path}`,
          );
        });
        proxyServer.on('error', (err) => {
          logger?.error(`proxy for ${apiRoute} to ${target} failed: ${err.message}`);
        });
      };

      return {
        target,
        // default options
        changeOrigin: true,
        secure: process.env.NODE_ENV === 'production',
        rewrite: (path) => path.replace(new RegExp(`^${route}`), ''),

        // provided options
        ...providedOptions,

        // custom options - required for response transformation
        selfHandleResponse: true,
        configure,
      };
    },
  };
}
