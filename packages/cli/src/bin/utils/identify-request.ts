import { defaultHeaders } from './default-headers.js';

/**
 * Adds the Fusion Framework CLI identification headers (`X-Fusion-CLI-Name`,
 * `X-Fusion-CLI-Version` and `User-Agent`) to an outgoing HTTP request.
 *
 * Intended as a default request handler on the HTTP module so that every client
 * created by the CLI (service discovery included) identifies itself, instead of
 * each command having to remember to pass the headers. Headers already present on
 * the request are kept, so a caller can still override the identification.
 *
 * @template TRequest - Request shape carrying an optional `headers` init.
 * @param request - The outgoing request being processed by the HTTP request handler.
 * @returns A copy of the request with the identification headers applied.
 *
 * @example
 * ```typescript
 * builder.defaultHttpRequestHandler.set('fusion-cli-identification', identifyRequest);
 * ```
 */
export const identifyRequest = <TRequest extends { headers?: HeadersInit }>(
  request: TRequest,
): TRequest => {
  const headers = new Headers(request.headers);
  // Walk every identification header so each one is applied independently
  for (const [name, value] of Object.entries(defaultHeaders)) {
    // Never overwrite a value the caller set explicitly
    if (!headers.has(name)) {
      headers.set(name, value);
    }
  }
  return { ...request, headers };
};

export default identifyRequest;
