import { readJsonBody } from '../server/read-json-body.js';

import type { IncomingMessage, ServerResponse } from 'node:http';

/** A {@link ServerResponse}, extended with `res.json()`/`res.text()` — set `res.statusCode` first to send anything other than `200`. */
export interface MockResponse extends ServerResponse {
  /** Sends `body` as JSON, at `res.statusCode` (`200` unless set beforehand). */
  json(body: unknown): void;
  /** Sends `body` as plain text, at `res.statusCode` (`200` unless set beforehand). */
  text(body: string): void;
}

/**
 * The third argument a {@link RouteHandler} receives: the request body, parsed as JSON
 * (`undefined` for an empty body), plus the mock server's own seed, if any — so a
 * handler can seed its own faker calls and still reproduce the same values on `reset()`.
 */
export interface RouteContext {
  /** The request body, parsed as JSON. `undefined` for an empty body. */
  body: unknown;
  /** The mock server's own seed (see `CreateMockServerOptions`), if one was set. */
  seed?: number;
}

/** A route handler for a {@link Router}, checked ahead of a service's generated mock responses. */
export type RouteHandler = (req: IncomingMessage, res: MockResponse, ctx: RouteContext) => unknown;

/**
 * A minimal Express-style router for `ServiceBuilder.middleware(router => ...)` — exact
 * path + method matching only, checked ahead of a service's own generated mock responses.
 */
export interface Router {
  get(path: string, handler: RouteHandler): void;
  post(path: string, handler: RouteHandler): void;
  put(path: string, handler: RouteHandler): void;
  patch(path: string, handler: RouteHandler): void;
  delete(path: string, handler: RouteHandler): void;
  options(path: string, handler: RouteHandler): void;
  /**
   * Attempts to handle `req`; returns `true` if a registered route matched (and `res` was
   * written to).
   *
   * @param seed - The mock server's own seed (see `CreateMockServerOptions`), threaded into the handler's {@link RouteContext}.
   */
  handle(req: IncomingMessage, res: ServerResponse, seed?: number): Promise<boolean>;
}

/** Extends `res` with `json()`/`text()`, both respecting whatever `res.statusCode` is at the time they're called. */
function toMockResponse(res: ServerResponse): MockResponse {
  const mockResponse = res as MockResponse;
  mockResponse.json = (body) => {
    res.writeHead(res.statusCode, { 'content-type': 'application/json' });
    res.end(JSON.stringify(body));
  };
  mockResponse.text = (body) => {
    res.writeHead(res.statusCode, { 'content-type': 'text/plain' });
    res.end(body);
  };
  return mockResponse;
}

/** Creates an empty {@link Router}.
 *
 * @returns A new, empty {@link Router}.
 */
export function createRouter(): Router {
  const routes = new Map<string, RouteHandler>();

  function register(method: string, path: string, handler: RouteHandler): void {
    routes.set(`${method} ${path}`, handler);
  }

  return {
    get: (path, handler) => register('GET', path, handler),
    post: (path, handler) => register('POST', path, handler),
    put: (path, handler) => register('PUT', path, handler),
    patch: (path, handler) => register('PATCH', path, handler),
    delete: (path, handler) => register('DELETE', path, handler),
    options: (path, handler) => register('OPTIONS', path, handler),
    async handle(req, res, seed) {
      const pathname = new URL(req.url ?? '/', 'http://localhost').pathname;
      const handler = routes.get(`${req.method} ${pathname}`);
      // No route registered for this method+path: let the caller fall through to its own mock.
      if (!handler) return false;
      await handler(req, toMockResponse(res), { body: await readJsonBody(req), seed });
      return true;
    },
  };
}

export default createRouter;
