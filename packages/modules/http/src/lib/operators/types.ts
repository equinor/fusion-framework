import type { Observable } from 'rxjs';
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
