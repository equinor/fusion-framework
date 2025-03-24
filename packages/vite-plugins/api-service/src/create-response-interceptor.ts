import { responseInterceptor } from 'http-proxy-middleware';

import type { IncomingMessage, ServerResponse } from 'node:http';

import type { JsonData, ProxyListener } from './types.js';

type ResponseInterceptorCallback<TResponse, TResult> = (
  data: TResponse,
) => TResult | Promise<TResult>;

/**
 * Intercepts the API response and transforms it using the provided callback function.
 *
 * This function is designed to work with `http-proxy-middleware`'s `responseInterceptor`.
 * It allows you to modify the response data before it is sent to the client by applying
 * a transformation callback.
 *
 * **Note:** This function assumes that the response from the API is valid JSON. If the
 * response is not JSON, attempting to parse it will throw an error, causing the returned
 * promise to reject, which may result in the proxy sending an error response to the client.
 *
 * @template TResponse - The type of the original response data, which must be JSON-serializable.
 * @template TResult - The type of the transformed response data, which must also be JSON-serializable. Defaults to `TResponse`.
 *
 * @param callback - A function that takes the original response data of type `TResponse`
 * and returns the transformed data of type `TResult`.
 *
 * @returns A function that intercepts the response, applies the callback transformation,
 * and sends the transformed response to the client. This function is intended to be used
 * as the `onProxyRes` handler in `http-proxy-middleware`.
 *
 * @param proxyRes - The original response from the proxy server.
 * @param req - The original incoming request from the client.
 * @param res - The server response to be sent to the client.
 *
 * @example
 * ```typescript
 * import { apiResponseInterceptor } from './api-response-interceptor';
 *
 * type OriginalResponseType = { foo: string };
 * type TransformedResponseType = { bar: string };
 *
 * const transformResponse = (data: OriginalResponseType): TransformedResponseType => {
 *   return { bar: data.foo };
 * };
 *
 * const interceptor = apiResponseInterceptor(transformResponse);
 *
 * // Use the interceptor in your server setup
 * app.use('/api', createProxyMiddleware({
 *   target: 'http://example.com',
 *   changeOrigin: true,
 *   selfHandleResponse: true,
 *   onProxyRes: interceptor,
 * }));
 * ```
 */
export function createResponseInterceptor<
  TResponse extends JsonData,
  TResult extends JsonData = TResponse,
>(callback: ResponseInterceptorCallback<TResponse, TResult>): ProxyListener {
  // Callback function for standard proxy handler
  return async (
    proxyRes: IncomingMessage,
    req: IncomingMessage,
    res: ServerResponse,
  ): Promise<void> => {
    // Apply the response interceptor
    const interceptor = responseInterceptor(async (responseBuffer): Promise<string> => {
      // Parse the response data and apply the callback transformation
      const response = JSON.parse(responseBuffer.toString()) as TResponse;

      // Apply the callback transformation
      const result = await Promise.resolve(callback(response));

      // Convert the transformed data to a JSON string
      return JSON.stringify(result);
    });

    // Return the transformed response
    await interceptor(proxyRes, req, res);
  };
}
