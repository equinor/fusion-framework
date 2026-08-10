import { firstValueFrom, from, of } from 'rxjs';
import type { Observable, ObservableInput } from 'rxjs';

import type { HttpMiddleware, HttpMiddlewareNext, IHttpMiddlewareHandler } from './types';

/**
 * Normalizes a step's result to a `Promise`, so a middleware calling `next(...)` never has to
 * branch on whether the next step short-circuited with a plain `Response` or reached all the
 * way to an Observable-returning network call.
 */
function toPromise(result: Response | ObservableInput<Response>): Promise<Response> {
  return result instanceof Response ? Promise.resolve(result) : firstValueFrom(from(result));
}

/**
 * Composes registered {@link HttpMiddleware} into a single execution pipeline wrapping the
 * network call, so retries, caching, telemetry, or circuit-breaking can wrap `_performFetch`
 * without touching request or response payload transforms.
 *
 * @see {@link HttpClient}
 */
export class HttpMiddlewareHandler implements IHttpMiddlewareHandler {
  #middleware: HttpMiddleware[];

  /**
   * Constructs a handler, optionally cloning another handler's registered middleware.
   * @param source - An existing handler to clone the registered middleware from.
   */
  constructor(source?: IHttpMiddlewareHandler) {
    this.#middleware = source ? [...source.middleware] : [];
  }

  /** @inheritdoc */
  get middleware(): readonly HttpMiddleware[] {
    return this.#middleware;
  }

  /** @inheritdoc */
  use(middleware: HttpMiddleware): HttpMiddlewareHandler {
    this.#middleware.push(middleware);
    return this;
  }

  /** @inheritdoc */
  process(uri: string, init: RequestInit, terminal: HttpMiddlewareNext): Observable<Response> {
    // wrap outward-in so the first-registered middleware is outermost, matching a conventional middleware chain
    const chain = this.#middleware.reduceRight<HttpMiddlewareNext>(
      (next, middleware) => (nextUri, nextInit) => middleware(nextUri, nextInit, (u, i) => toPromise(next(u, i))),
      terminal,
    );
    const result = chain(uri, init);
    // a middleware may short-circuit with a plain Response (no ObservableInput wrapping needed)
    return result instanceof Response ? of(result) : from(result);
  }
}

export default HttpMiddlewareHandler;
