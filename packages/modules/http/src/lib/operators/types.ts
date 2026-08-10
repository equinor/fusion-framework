import type { Observable, ObservableInput } from 'rxjs';
import type { FetchRequest } from '../client';

/**
 * A process operator that takes a request of type `T` and returns a transformed request of type `R`, or `void`, or a Promise that resolves to `R` or `void`.
 *
 * Process operators are used to transform or modify requests in a sequential pipeline before they are processed by an `IHttpRequestHandler`.
 *
 * @template T The type of the input request.
 * @template R The type of the output request. Defaults to `T` if not specified.
 * @param request The input request to be processed.
 * @returns The transformed request, `void`, or a Promise that resolves to the transformed request or `void`.
 */
// biome-ignore lint/suspicious/noConfusingVoidType: `void` here relies on TypeScript's special-cased "void-returning callback accepts any return value" behavior for process operators \u2014 `undefined` would break assignability of operator functions that return a transformed request
export type ProcessOperator<T, R = T> = (request: T) => R | void | Promise<R | void>;

/**
 * Represents a collection of process operators.
 * @template T The type of the request being processed.
 */
export interface IProcessOperators<T> {
  /**
   * Gets the operators registered in the collection.
   */
  get operators(): Record<string, ProcessOperator<T>>;

  /**
   * Adds a new operator to the collection.
   * @param key The key to identify the operator.
   * @param operator The process operator to add.
   * @returns The updated collection of process operators.
   * @throws An error if the operator is already defined.
   */
  add(key: string, operator: ProcessOperator<T>): IProcessOperators<T>;

  /**
   * Adds or sets a process operator in the collection.
   * @param key The key to identify the operator.
   * @param operator The process operator to add or set.
   * @returns The updated collection of process operators.
   */
  set(key: string, operator: ProcessOperator<T>): IProcessOperators<T>;

  /**
   * Removes a process operator from the collection.
   * @param key The key of the operator to remove.
   * @returns The updated collection of process operators.
   */
  remove(key: string): IProcessOperators<T>;

  /**
   * Gets a process operator from the collection.
   * @param key The key of the operator to retrieve.
   * @returns The process operator associated with the key, or undefined if the key is invalid.
   */
  get(key: string): ProcessOperator<T>;

  /**
   * Processes the registered process operators.
   * @param request The request to process.
   * @returns An observable that emits the processed request.
   */
  process(request: T): Observable<T>;
}

/**
 * Represents an HTTP request handler that extends the `IProcessOperators` interface.
 * This interface provides methods to manage and process HTTP request operators.
 *
 * @template T - The type of the request being processed. Defaults to `FetchRequest`.
 */
export interface IHttpRequestHandler<T extends FetchRequest = FetchRequest>
  extends IProcessOperators<T> {
  /**
   * Set header that will apply on all requests done by consumer @see {HttpClient}
   * @param key - name of header
   * @param value  - header value
   */
  setHeader(key: string, value: string): IHttpRequestHandler<T>;
}

/**
 * Represents an HTTP response handler that extends the `IProcessOperators` interface.
 * This interface provides methods to manage and process HTTP response operators.
 *
 * @template T - The type of the response being processed. Defaults to `Response`.
 */
export interface IHttpResponseHandler<T = Response> extends IProcessOperators<T> {}

/**
 * Continues an HTTP request by resolving the given (already-processed) request into a response.
 *
 * @remarks
 * The terminal `next` passed to the outermost {@link HttpMiddleware} ultimately resolves to
 * `HttpClient._performFetch` — the same overridable seam the mock system replaces — so
 * middleware wraps around either the real network call or a mocked one transparently.
 *
 * @param uri - The fully resolved URL for the request.
 * @param init - The prepared `fetch` request options.
 * @returns The resulting `Response`, or an observable input of it.
 */
export type HttpMiddlewareNext = (
  uri: string,
  init: RequestInit,
) => Response | ObservableInput<Response>;

/**
 * Continues to the next registered {@link HttpMiddleware}, or the network call itself,
 * always resolving to a `Response` regardless of how that next step actually produced it —
 * a short-circuited `Response`, a `Promise`, or an `Observable`.
 *
 * @param uri - The fully resolved URL for the request.
 * @param init - The prepared `fetch` request options.
 * @returns A promise of the resulting `Response`.
 */
export type HttpMiddlewareContinuation = (uri: string, init: RequestInit) => Promise<Response>;

/**
 * Wraps request execution to add cross-cutting behavior — retries, caching, telemetry,
 * circuit breaking — around the network call itself, rather than transforming the
 * request or response payload.
 *
 * @remarks
 * Unlike {@link ProcessOperator}, which transforms a value in a linear pipeline, a middleware
 * controls whether and how many times `next` runs: it can short-circuit by never calling
 * `next`, retry by calling it more than once, or recover from a rejection it throws.
 * Registered middleware compose in an "onion" — the first one registered is outermost, so it
 * sees the request first and the response last.
 *
 * @param uri - The fully resolved URL for the request.
 * @param init - The prepared `fetch` request options.
 * @param next - Continues to the next registered middleware, or the network call itself.
 * @returns The resulting `Response`, or an observable input of it.
 *
 * @example Retry once on a failed response
 * ```typescript
 * const retryOnce: HttpMiddleware = async (uri, init, next) => {
 *   const response = await next(uri, init);
 *   return response.ok ? response : next(uri, init);
 * };
 * ```
 */
export type HttpMiddleware = (
  uri: string,
  init: RequestInit,
  next: HttpMiddlewareContinuation,
) => Response | ObservableInput<Response>;

/**
 * Registers and composes {@link HttpMiddleware} into a single execution pipeline wrapping
 * the network call.
 */
export interface IHttpMiddlewareHandler {
  /**
   * Gets the registered middleware, in registration order.
   */
  get middleware(): readonly HttpMiddleware[];

  /**
   * Registers a middleware, wrapping every middleware registered before it.
   * @param middleware - The middleware to register.
   * @returns The updated handler, for chaining.
   */
  use(middleware: HttpMiddleware): IHttpMiddlewareHandler;

  /**
   * Runs the registered middleware chain around a request, ending with `terminal`.
   * @param uri - The fully resolved URL for the request.
   * @param init - The prepared `fetch` request options.
   * @param terminal - The innermost step the chain wraps, called when every middleware defers to `next`.
   * @returns An observable of the resulting `Response`.
   */
  process(uri: string, init: RequestInit, terminal: HttpMiddlewareNext): Observable<Response>;
}
