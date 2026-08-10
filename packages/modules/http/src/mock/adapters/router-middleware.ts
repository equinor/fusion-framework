import type { HttpMiddleware } from '../../lib/operators/types';

/**
 * A route match handed to a {@link MockRouteHandler} once its pattern has matched a request.
 */
export interface MockRouteMatch {
  /** Path parameters extracted from named segments in the route pattern, e.g. `:id` -> `params.id`. */
  params: Record<string, string>;
  /** The fully resolved request URL, for reading query parameters via `url.searchParams`. */
  url: URL;
  /** The request as a Fetch-standard `Request`, for reading headers or a JSON/text body. */
  request: Request;
}

/** Builds the `Response` for one matched route. */
export type MockRouteHandler = (match: MockRouteMatch) => Response | Promise<Response>;

/**
 * Registers route handlers for {@link createRouterMiddleware}, in the style of a minimal
 * Express-like router — path templates (`:id`) and per-method registration, without pulling
 * in a real routing library.
 */
export interface IMockRouterBuilder {
  /** Registers `handler` for `GET` requests matching `path`. @see {@link IMockRouterBuilder.on} */
  get(path: string, handler: MockRouteHandler): IMockRouterBuilder;
  /** Registers `handler` for `POST` requests matching `path`. @see {@link IMockRouterBuilder.on} */
  post(path: string, handler: MockRouteHandler): IMockRouterBuilder;
  /** Registers `handler` for `PUT` requests matching `path`. @see {@link IMockRouterBuilder.on} */
  put(path: string, handler: MockRouteHandler): IMockRouterBuilder;
  /** Registers `handler` for `PATCH` requests matching `path`. @see {@link IMockRouterBuilder.on} */
  patch(path: string, handler: MockRouteHandler): IMockRouterBuilder;
  /** Registers `handler` for `DELETE` requests matching `path`. @see {@link IMockRouterBuilder.on} */
  delete(path: string, handler: MockRouteHandler): IMockRouterBuilder;
  /**
   * Registers `handler` for a method and path template.
   * @param method - The HTTP method to match, case-insensitively, or `undefined` to match any method.
   * @param path - A path template relative to the router's base URI. A segment starting with
   *   `:` (e.g. `/contexts/:id`) captures that segment into `params`; every other segment must
   *   match literally. A trailing slash is always optional.
   * @param handler - Builds the `Response` for a matching request.
   */
  on(method: string | undefined, path: string, handler: MockRouteHandler): IMockRouterBuilder;
}

interface RegisteredRoute {
  method: string | undefined;
  regexp: RegExp;
  keys: string[];
  handler: MockRouteHandler;
}

/**
 * Compiles a path template into a matching `RegExp` plus the ordered list of named parameters
 * it captures.
 *
 * @param path - A path template such as `/contexts/:id`.
 * @returns The compiled pattern and the parameter names it captures, in segment order.
 */
function compilePath(path: string): { regexp: RegExp; keys: string[] } {
  const keys: string[] = [];
  const pattern = path
    .split('/')
    // each segment either captures a path parameter or must match literally
    .map((segment) =>
      segment.startsWith(':')
        ? (keys.push(segment.slice(1)), '([^/]+)')
        : segment.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
    )
    .join('/');
  return { regexp: new RegExp(`^${pattern}/?$`), keys };
}

/**
 * Builds an {@link HttpMiddleware} that answers requests to one base URI with hand-registered
 * route handlers, matched by method and a path template (`:id`-style segments) — a lightweight
 * router for tests with more than a couple of routes to fake, without hand-rolling `RegExp`
 * matching against `uri` in every middleware.
 *
 * @remarks
 * A request outside `baseUri`, or matching no registered route, falls through to `next`, so
 * this composes with other middleware — including the real network call, or another router
 * for a different base URI — registered around it. Routes are tried in registration order;
 * the first match wins.
 *
 * Deliberately not an MSW-compatible API — this stays inside `addMiddleware`'s own request
 * pipeline rather than intercepting the network boundary, so it has none of MSW's response
 * transformers, `onUnhandledRequest` diagnostics, or wildcard patterns.
 *
 * @param baseUri - The base URI this router answers for, e.g. `https://api.example.com`.
 * @param build - Registers routes on the given {@link IMockRouterBuilder}.
 * @returns A middleware for {@link IHttpClientConfigurator.addMiddleware}.
 *
 * @example Fake a handful of routes under one base URI
 * ```typescript
 * configurator.http.addMiddleware(
 *   createRouterMiddleware('https://context.example.com', (router) => {
 *     router.get('/contexts/:id/relations', () => Response.json([{ id: 'ctx-3' }]));
 *     router.get('/contexts', () => Response.json([{ id: 'ctx-2' }]));
 *     router.get('/contexts/:id', ({ params }) => Response.json({ id: params.id }));
 *   }),
 * );
 * ```
 */
export function createRouterMiddleware(
  baseUri: string,
  build: (router: IMockRouterBuilder) => void,
): HttpMiddleware {
  const routes: RegisteredRoute[] = [];
  const register = (
    method: string | undefined,
    path: string,
    handler: MockRouteHandler,
  ): IMockRouterBuilder => {
    const { regexp, keys } = compilePath(path);
    routes.push({ method: method?.toUpperCase(), regexp, keys, handler });
    return router;
  };
  const router: IMockRouterBuilder = {
    get: (path, handler) => register('GET', path, handler),
    post: (path, handler) => register('POST', path, handler),
    put: (path, handler) => register('PUT', path, handler),
    patch: (path, handler) => register('PATCH', path, handler),
    delete: (path, handler) => register('DELETE', path, handler),
    on: register,
  };
  build(router);

  const base = new URL(baseUri);
  const basePath = base.pathname.replace(/\/$/, '');

  return async (uri, init, next) => {
    const url = new URL(uri);
    // requests to a different origin, or outside this router's base path, are none of its concern
    if (url.origin !== base.origin || !url.pathname.startsWith(basePath)) return next(uri, init);

    const pathname = url.pathname.slice(basePath.length) || '/';
    const method = (init.method ?? 'GET').toUpperCase();

    // first registered route whose method and pattern both match wins
    for (const route of routes) {
      if (route.method && route.method !== method) continue;
      const match = route.regexp.exec(pathname);
      if (!match) continue;
      const params = Object.fromEntries(route.keys.map((key, i) => [key, match[i + 1]]));
      return route.handler({ params, url, request: new Request(uri, init) });
    }

    return next(uri, init);
  };
}

export default createRouterMiddleware;
