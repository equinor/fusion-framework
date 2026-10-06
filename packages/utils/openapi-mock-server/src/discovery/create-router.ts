import { readJsonBody } from '../server/read-json-body.js';
import { parseMockRequestIdentity } from '../parse-mock-request-identity.js';

import type { IncomingMessage, ServerResponse } from 'node:http';
import { match, type MatchFunction, type ParamData } from 'path-to-regexp';

/** A {@link ServerResponse}, extended with `res.json()`/`res.text()` — set `res.statusCode` first to send anything other than `200`. */
export interface MockResponse extends ServerResponse {
  /** Sends `body` as JSON, at `res.statusCode` (`200` unless set beforehand). */
  json(body: unknown): void;
  /** Sends `body` as plain text, at `res.statusCode` (`200` unless set beforehand). */
  text(body: string): void;
}

/**
 * The third argument a {@link RouteHandler} receives: service-relative routing data,
 * parsed request input, session-aware mock-auth state, and the mock server seed.
 */
export interface RouteContext {
  /**
   * The request body, parsed as JSON. `undefined` for an empty body, and for a body declared with
   * a non-JSON `content-type` that is not valid JSON — the route decides how to answer it.
   */
  body: unknown;
  /** The mock server's own seed (see `CreateMockServerOptions`), if one was set. */
  seed?: number;
  /** Decoded parameters captured from a parameterized service-relative route. */
  params: Readonly<ParamData>;
  /** Parsed service-relative request URL. */
  url: URL;
  /** Parsed query parameters from {@link RouteContext.url}. */
  query: URLSearchParams;
  /** Explicit mock-only authentication state derived from a supported token or browser session. */
  identity: MockRequestIdentity;
}

/** Normalized test-only authentication state available to middleware route handlers. */
export type MockRequestIdentity =
  | {
      /** A supported mock-auth token supplied normalized identity claims. */
      status: 'authenticated';
      /** Stable user identifier normalized from the mock token's `oid` claim. */
      userId: string;
      /** Opaque browser-session identifier when identity came from session-scoped mock auth. */
      sessionId?: string;
      /** Decoded claims from the supported mock-auth token. */
      claims: Readonly<Record<string, unknown>>;
    }
  | {
      /** No Authorization header was supplied. */
      status: 'missing';
    }
  | {
      /** The Authorization header or bearer token could not be parsed. */
      status: 'malformed';
    }
  | {
      /** A bearer token was parsed but was not issued by this mock server. */
      status: 'unsupported';
    };

/** A route handler for a {@link Router}, checked ahead of a service's generated mock responses. */
export type RouteHandler = (req: IncomingMessage, res: MockResponse, ctx: RouteContext) => unknown;

interface RegisteredRoute {
  handler: RouteHandler;
  matchPath: MatchFunction<ParamData>;
  method: string;
}

/**
 * A minimal Express-style router for `ServiceBuilder.middleware(router => ...)` — exact
 * and parameterized path + method matching, checked ahead of generated mock responses.
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
   * @param req - Incoming Node.js request, left unchanged by service-relative matching.
   * @param res - Node.js response completed by a matched route.
   * @param seed - The mock server's own seed (see `CreateMockServerOptions`), threaded into the handler's {@link RouteContext}.
   * @param serviceUrl - Optional parsed service-relative URL supplied by the standalone server.
   * @param identity - Optional server-resolved mock-auth identity for proxied browser requests.
   * @returns Whether an exact or parameterized route handled the request.
   */
  handle(
    req: IncomingMessage,
    res: ServerResponse,
    seed?: number,
    serviceUrl?: URL,
    identity?: MockRequestIdentity,
  ): Promise<boolean>;
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

/**
 * Matches one registered route while treating malformed percent encoding as an unmatched request.
 *
 * @param route - Compiled route candidate.
 * @param pathname - Service-relative request pathname.
 * @returns The decoded match result, or `false` when the route or encoding does not match.
 * @throws Unexpected matcher failures that do not represent malformed URL encoding.
 */
function matchRegisteredRoute(
  route: RegisteredRoute,
  pathname: string,
): ReturnType<RegisteredRoute['matchPath']> {
  try {
    return route.matchPath(pathname);
  } catch (error) {
    // Invalid percent encoding is malformed input, so this candidate must behave as unmatched.
    if (error instanceof URIError) return false;
    throw error;
  }
}

/**
 * Checks whether a request declares a `content-type` other than JSON (`application/json` or a
 * `+json` suffix). A request without a `content-type` is not counted as declaring one.
 *
 * @param req - Incoming request.
 * @returns Whether the request declares a non-JSON media type.
 */
function declaresNonJsonContent(req: IncomingMessage): boolean {
  const type = req.headers['content-type']?.split(';')[0]?.trim().toLowerCase();
  // An absent type is treated as JSON, so clients that omit the header keep JSON parsing.
  if (!type) return false;
  return type !== 'application/json' && !type.endsWith('+json');
}

/** Creates an empty {@link Router}.
 *
 * @remarks
 * A matched route whose body is declared as JSON (or not declared) but is not valid JSON is
 * answered with `400` and an `InvalidJson` error, without calling the route handler. A body
 * declared with another `content-type` that is not JSON reaches the handler as `body: undefined`,
 * so the route can answer it itself, for example with `415`.
 *
 * @returns A new, empty {@link Router}.
 * @throws From `handle`, when reading a request body fails for a reason other than invalid JSON.
 */
export function createRouter(): Router {
  const exactRoutes = new Map<string, RouteHandler>();
  const registeredRoutes: RegisteredRoute[] = [];

  function register(method: string, path: string, handler: RouteHandler): void {
    exactRoutes.set(`${method} ${path}`, handler);
    // Disabling optional trailing delimiters preserves the router's previous exact-path semantics.
    registeredRoutes.push({ method, handler, matchPath: match(path, { trailing: false }) });
  }

  return {
    get: (path, handler) => register('GET', path, handler),
    post: (path, handler) => register('POST', path, handler),
    put: (path, handler) => register('PUT', path, handler),
    patch: (path, handler) => register('PATCH', path, handler),
    delete: (path, handler) => register('DELETE', path, handler),
    options: (path, handler) => register('OPTIONS', path, handler),
    async handle(req, res, seed, serviceUrl, identity) {
      const url = serviceUrl ?? new URL(req.url ?? '/', 'http://localhost');
      const method = req.method ?? 'GET';
      const handler = exactRoutes.get(`${method} ${url.pathname}`);
      // No route registered for this method+path: let the caller fall through to its own mock.
      let params: Readonly<ParamData> = {};
      let matchedHandler = handler;
      // Exact routes always win; parameterized routes otherwise retain deterministic registration order.
      if (!matchedHandler) {
        // Registration order is the tie-breaker when multiple parameterized routes could match.
        for (const route of registeredRoutes) {
          // Routes registered for another method cannot match this request.
          if (route.method !== method) continue;
          const result = matchRegisteredRoute(route, url.pathname);
          // Keep searching until the first parameterized route matches.
          if (!result) continue;
          matchedHandler = route.handler;
          params = result.params;
          // The first match is authoritative so later generic patterns cannot shadow it.
          break;
        }
      }
      // No route registered for this method+path: let the caller fall through to its own mock.
      if (!matchedHandler) return false;

      let body: unknown;
      try {
        body = await readJsonBody(req);
      } catch (error) {
        // Malformed client input is a bad request, not a mock server failure.
        if (!(error instanceof SyntaxError)) throw error;
        // Only a body claimed (or assumed) to be JSON is invalid JSON; others are left to the route.
        if (!declaresNonJsonContent(req)) {
          const response = toMockResponse(res);
          response.statusCode = 400;
          response.json({
            error: {
              code: 'InvalidJson',
              message: `Request body is not valid JSON: ${error.message}`,
            },
          });
          return true;
        }
        // The route sees no body and can reject the media type itself, for example with 415.
        body = undefined;
      }

      await matchedHandler(req, toMockResponse(res), {
        body,
        seed,
        params,
        url,
        query: url.searchParams,
        identity: identity ?? parseMockRequestIdentity(req.headers.authorization),
      });
      return true;
    },
  };
}

export default createRouter;
