/**
 * A middleware answers a request, or declines it by returning `undefined` (or
 * a promise of `undefined`) so the next registered middleware — or the
 * router's own "no handler matched" error — gets a chance instead.
 *
 * @remarks
 * The signature is exactly `(request: Request) => Response | undefined`, on
 * purpose: it is the same shape most fetch-based routers already use (Hono,
 * itty-router, service-worker route handlers, `@whatwg-node/router`), so
 * dropping one of those in as a middleware needs no adapter at all. A backend
 * with a different shape — Express-style `(req, res)` handlers, or
 * `openapi-backend`'s `handleRequest(request, ...args)` — needs a thin
 * adapter; see {@link fromExpressStyleHandler}.
 */
export type HttpMockMiddleware = (
  request: Request,
) => Response | undefined | Promise<Response | undefined>;

interface RegisteredMiddleware {
  method?: string;
  match?: string | RegExp;
  handler: HttpMockMiddleware;
}

/**
 * Runs a chain of middleware against requests and answers them without
 * reaching the network.
 *
 * @remarks
 * Middleware runs in registration order; the first one to return a
 * `Response` (rather than `undefined`) wins, exactly like a conventional
 * middleware chain. `.get`/`.post`/`.put`/`.patch`/`.delete`/`.on` are sugar
 * for the common "match a method and a URL" case — each registers a
 * `use`-compatible middleware under the hood, so mixing them with a
 * general-purpose backend registered through `.use` composes without
 * surprises.
 *
 * This is the piece {@link HttpMockConfigurator} builds its client from — a
 * test rarely constructs this class directly.
 *
 * @example Register a whole backend as one middleware
 * ```typescript
 * configurator.http.use(fromExpressStyleHandler((req, res) => api.handleRequest(req, req, res)));
 * ```
 */
export class HttpMockRouter {
  #middleware: RegisteredMiddleware[] = [];

  /**
   * Registers a middleware, run for every request regardless of method or URL.
   *
   * @remarks
   * This is the extension point for dropping in a whole router or backend —
   * `openapi-backend`, a hand-rolled `switch` on `request.method`/`request.url`,
   * or any function shaped `(request: Request) => Response | undefined`.
   *
   * @param handler - Answers the request, or returns `undefined` to decline it.
   * @returns This router, for chaining.
   */
  public use(handler: HttpMockMiddleware): this {
    this.#middleware.push({ handler });
    return this;
  }

  /**
   * Registers a middleware for a method and URL match.
   *
   * @param method - The request method to match, or `undefined` to match any method.
   * @param match - A substring of, or a pattern tested against, the request's resolved URL.
   * @param handler - Answers the request, or returns `undefined` to decline it.
   * @returns This router, for chaining.
   */
  public on(method: string | undefined, match: string | RegExp, handler: HttpMockMiddleware): this {
    this.#middleware.push({ method: method?.toUpperCase(), match, handler });
    return this;
  }

  /**
   * Registers a middleware for `GET` requests.
   * @param match - The URL substring or pattern to match.
   * @param handler - Answers the request, or returns `undefined` to continue.
   * @returns This router, for chaining.
   * @see {@link on}
   */
  public get(match: string | RegExp, handler: HttpMockMiddleware): this {
    return this.on('GET', match, handler);
  }

  /**
   * Registers a middleware for `POST` requests.
   * @param match - The URL substring or pattern to match.
   * @param handler - Answers the request, or returns `undefined` to continue.
   * @returns This router, for chaining.
   * @see {@link on}
   */
  public post(match: string | RegExp, handler: HttpMockMiddleware): this {
    return this.on('POST', match, handler);
  }

  /**
   * Registers a middleware for `PUT` requests.
   * @param match - The URL substring or pattern to match.
   * @param handler - Answers the request, or returns `undefined` to continue.
   * @returns This router, for chaining.
   * @see {@link on}
   */
  public put(match: string | RegExp, handler: HttpMockMiddleware): this {
    return this.on('PUT', match, handler);
  }

  /**
   * Registers a middleware for `PATCH` requests.
   * @param match - The URL substring or pattern to match.
   * @param handler - Answers the request, or returns `undefined` to continue.
   * @returns This router, for chaining.
   * @see {@link on}
   */
  public patch(match: string | RegExp, handler: HttpMockMiddleware): this {
    return this.on('PATCH', match, handler);
  }

  /**
   * Registers a middleware for `DELETE` requests.
   * @param match - The URL substring or pattern to match.
   * @param handler - Answers the request, or returns `undefined` to continue.
   * @returns This router, for chaining.
   * @see {@link on}
   */
  public delete(match: string | RegExp, handler: HttpMockMiddleware): this {
    return this.on('DELETE', match, handler);
  }

  /**
   * Removes every registered middleware.
   *
   * @remarks
   * Useful between tests that share a router, so one test's routes cannot
   * leak into the next.
   *
   * @returns This router, for chaining.
   */
  public reset(): this {
    this.#middleware = [];
    return this;
  }

  /**
   * Resolves a request against the registered middleware chain.
   *
   * @param url - The fully resolved URL of the request.
   * @param init - The `fetch` request options the client prepared.
   * @returns The first middleware's response.
   * @throws {Error} If no middleware answers, naming the method and URL so the
   *   test failure points straight at the missing registration.
   */
  public async resolve(url: string, init: RequestInit): Promise<Response> {
    const request = new Request(url, init);
    const method = request.method.toUpperCase();
    // Preserve registration order so the first matching middleware owns the response.
    for (const registered of this.#middleware) {
      // Skip handlers registered for another HTTP method.
      if (registered.method && registered.method !== method) continue;
      // Only apply URL matching when the registration specifies a URL constraint.
      if (registered.match !== undefined) {
        const matched =
          typeof registered.match === 'string'
            ? url.includes(registered.match)
            : registered.match.test(url);
        // Continue searching when this handler's URL constraint does not match.
        if (!matched) continue;
      }
      // clone the request so one middleware reading the body (e.g. `.json()`) does not
      // exhaust it for the next middleware in the chain
      const response = await registered.handler(request.clone());
      // Stop at the first middleware that answers so later handlers cannot override it.
      if (response !== undefined) return response;
    }
    throw new Error(
      `No mock handler matched ${method} ${url}. Register one with configurator.http.use(...), .on(...), or .get/.post/.put/.patch/.delete(...).`,
    );
  }
}

export default HttpMockRouter;
