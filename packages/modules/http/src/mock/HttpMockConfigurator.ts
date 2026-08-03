import { HttpClientConfigurator } from '../configurator';
import type { HttpClientMsal } from '../lib/client';

import { createHttpClientMockCtor } from './create-http-client-mock-ctor';
import { HttpMockRouter, type HttpMockMiddleware } from './HttpMockRouter';

/**
 * The real HTTP configurator, with every client it builds answering requests
 * from registered route handlers instead of the network.
 *
 * @remarks
 * Nothing else changes: named clients are still registered with
 * {@link HttpClientConfigurator.configureClient | configureClient}, `baseUri`,
 * `defaultScopes`, `requestHandler` and `onCreate` all still apply, and the
 * client returned is still an `HttpClientMsal` — only the network call itself
 * is replaced.
 *
 * One router is shared by every client this configurator builds, matched
 * against each request's fully resolved URL — so two named clients with
 * different `baseUri`s don't collide even when they use the same path.
 *
 * A whole backend — `openapi-backend`, a hand-rolled router, anything shaped
 * `(request: Request) => Response | undefined` — drops in through `.use`,
 * exactly like middleware; see
 * `@equinor/fusion-framework-module-http/mock` for
 * `fromExpressStyleHandler`, the adapter for backends with an Express-style
 * `(req, res)` handler shape instead.
 *
 * @example
 * ```typescript
 * configurator.http.configureClient('catalog', { baseUri: 'https://api.example.com' });
 * configurator.http.get('/items', () => Response.json([{ id: 1 }]));
 *
 * const items = await fusion.modules.http.createClient('catalog').json('/items');
 * ```
 */
export class HttpMockConfigurator extends HttpClientConfigurator<HttpClientMsal> {
  #router: HttpMockRouter;

  /** Creates a configurator with an empty shared mock router. */
  constructor() {
    const router = new HttpMockRouter();
    super(createHttpClientMockCtor(router));
    this.#router = router;
  }

  /**
   * Registers a middleware, run for every request regardless of method or URL.
   *
   * @remarks
   * Delegates to the shared {@link HttpMockRouter}. This is the extension
   * point for dropping in a whole backend as one registration; see
   * {@link HttpMockRouter.use}.
   *
   * @returns This configurator, for chaining.
   * @param handler - Answers each request, or returns `undefined` to continue.
   */
  public use(handler: HttpMockMiddleware): this {
    this.#router.use(handler);
    return this;
  }

  /**
   * Registers a handler for a method and URL match.
   *
   * @remarks
   * Delegates to the shared {@link HttpMockRouter}. See
   * {@link HttpMockRouter.on} for matching rules.
   *
   * @returns This configurator, for chaining.
   * @param method - The request method to match, or `undefined` for any method.
   * @param match - The URL substring or pattern to match.
   * @param handler - Answers the request, or returns `undefined` to continue.
   */
  public on(method: string | undefined, match: string | RegExp, handler: HttpMockMiddleware): this {
    this.#router.on(method, match, handler);
    return this;
  }

  /**
   * Registers a handler for `GET` requests.
   *
   * @param match - The URL substring or pattern to match.
   * @param handler - Answers the request, or returns `undefined` to continue.
   * @returns This configurator, for chaining.
   * @see {@link on}
   */
  public get(match: string | RegExp, handler: HttpMockMiddleware): this {
    this.#router.get(match, handler);
    return this;
  }

  /**
   * Registers a handler for `POST` requests.
   *
   * @param match - The URL substring or pattern to match.
   * @param handler - Answers the request, or returns `undefined` to continue.
   * @returns This configurator, for chaining.
   * @see {@link on}
   */
  public post(match: string | RegExp, handler: HttpMockMiddleware): this {
    this.#router.post(match, handler);
    return this;
  }

  /**
   * Registers a handler for `PUT` requests.
   *
   * @param match - The URL substring or pattern to match.
   * @param handler - Answers the request, or returns `undefined` to continue.
   * @returns This configurator, for chaining.
   * @see {@link on}
   */
  public put(match: string | RegExp, handler: HttpMockMiddleware): this {
    this.#router.put(match, handler);
    return this;
  }

  /**
   * Registers a handler for `PATCH` requests.
   *
   * @param match - The URL substring or pattern to match.
   * @param handler - Answers the request, or returns `undefined` to continue.
   * @returns This configurator, for chaining.
   * @see {@link on}
   */
  public patch(match: string | RegExp, handler: HttpMockMiddleware): this {
    this.#router.patch(match, handler);
    return this;
  }

  /**
   * Registers a handler for `DELETE` requests.
   *
   * @param match - The URL substring or pattern to match.
   * @param handler - Answers the request, or returns `undefined` to continue.
   * @returns This configurator, for chaining.
   * @see {@link on}
   */
  public delete(match: string | RegExp, handler: HttpMockMiddleware): this {
    this.#router.delete(match, handler);
    return this;
  }

  /**
   * Removes every registered handler.
   *
   * @returns This configurator, for chaining.
   */
  public resetHandlers(): this {
    this.#router.reset();
    return this;
  }
}

export default HttpMockConfigurator;
