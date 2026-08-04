import type { HttpMockMiddleware } from '../HttpMockRouter';

import { MockExpressResponse, type ExpressStyleResponse } from './MockExpressResponse';

/**
 * The default request shape {@link fromExpressStyleHandler} maps a `Request`
 * to — the shape `openapi-backend` and most Express-style routers expect.
 */
export interface ExpressStyleRequest {
  method: string;
  path: string;
  query: Record<string, string>;
  headers: Record<string, string>;
  body: unknown;
}

async function defaultToExpressStyleRequest(request: Request): Promise<ExpressStyleRequest> {
  const url = new URL(request.url);
  const contentType = request.headers.get('content-type') ?? '';
  const text = request.body ? await request.clone().text() : '';
  const body =
    contentType.includes('application/json') && text ? JSON.parse(text) : text || undefined;
  return {
    method: request.method,
    path: url.pathname,
    query: Object.fromEntries(url.searchParams),
    headers: Object.fromEntries(request.headers.entries()),
    body,
  };
}

/**
 * Adapts an Express-style `(req, res)` handler — including
 * `openapi-backend`'s `handleRequest(request, ...args)`, which forwards
 * whatever is passed after the routing request straight to the matched
 * operation handler — into an {@link HttpMockMiddleware}.
 *
 * @remarks
 * Only the request needs translating, from the Fetch API `Request` every
 * middleware receives to whatever shape the handler expects; the response
 * side is a {@link MockExpressResponse}, so `res.status(200).json(body)` — the
 * call every Express-style handler already makes — becomes the middleware's
 * `Response` with no further glue.
 *
 * @param handleRequest - Called with the mapped request and a {@link MockExpressResponse}.
 *   Anything it returns is ignored; the middleware waits for the response to
 *   answer through one of `.json`/`.send`/`.end` instead.
 * @param toRequest - Builds the handler's expected request shape from the raw
 *   `Request`. Defaults to `{ method, path, query, headers, body }` — the
 *   shape `openapi-backend` and most Express-style routers expect.
 * @returns A middleware for {@link HttpMockRouter.use}.
 * @template TRequest - The request shape expected by the handler.
 *
 * @example Register a whole `openapi-backend` instance as one middleware
 * ```typescript
 * const api = new OpenAPIBackend({ definition: './petstore.yml' });
 * api.register({ getPets: (c, req, res) => res.status(200).json([{ id: 1 }]) });
 * await api.init();
 *
 * configurator.http.use(fromExpressStyleHandler((req, res) => api.handleRequest(req, req, res)));
 * ```
 */
export function fromExpressStyleHandler<TRequest = ExpressStyleRequest>(
  handleRequest: (request: TRequest, response: ExpressStyleResponse) => unknown,
  toRequest: (request: Request) => TRequest | Promise<TRequest> = defaultToExpressStyleRequest as (
    request: Request,
  ) => TRequest | Promise<TRequest>,
): HttpMockMiddleware {
  return async (request) => {
    const req = await toRequest(request);
    const res = new MockExpressResponse();
    // Await so a rejecting async handler surfaces here instead of as an unhandled rejection.
    await handleRequest(req, res);
    return res.done;
  };
}

export default fromExpressStyleHandler;
