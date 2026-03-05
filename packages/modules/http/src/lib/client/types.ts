import type { ObservableInput, Observable } from 'rxjs';
import type { IHttpRequestHandler, IHttpResponseHandler } from '../operators/types';

/**
 * Represents a stream of response data.
 * @template T - The type of the response data.
 */
export type StreamResponse<T> = Observable<T>;

/**
 * A function that takes a `Response` object and returns an `ObservableInput` of type `T`.
 *
 * @template TResult - The type of the data contained in the response.
 * @template TResponse - The type of the response object.
 * @param response - The `Response` object to be processed.
 * @returns An `ObservableInput` of type `T`.
 */
export type ResponseSelector<TResult = unknown, TResponse = Response> = (
  response: TResponse,
) => ObservableInput<TResult>;

/**
 * Represents the parameters for a fetch request, including the URI and path.
 * @property {string} uri - The URI of the request.
 * @property {string} path - The path of the request.
 */
export type FetchRequest = RequestInit & {
  uri: string;
  path: string;
};

/**
 * Represents a request with a JSON body.
 * @template TRequest - The base request type, which extends `FetchRequest`.
 * @property {object | string | null} [body] - The request body, which can be an object, a string, or null.
 */
export type JsonRequest<TRequest extends FetchRequest = FetchRequest> = Omit<TRequest, 'body'> & {
  body?: object | string | null;
};

/**
 * Represents the result of a blob operation, including the filename (if available) and the blob itself.
 * @property {string} [filename] - The filename of the blob, if available.
 * @property {Blob} blob - The blob data.
 */
export type BlobResult = { filename?: string; blob: Blob };

/**
 * Represents the response from a fetch request, including the response object and a JSON parsing method.
 * @template T - The type of the response data.
 * @property {Response} - The original Response object.
 * @property {() => Promise<T>} json - A method to parse the response body as JSON and return the data as type T.
 */
export type FetchResponse<T = unknown> = Response & {
  json(): Promise<T>;
};

/**
 * Represents the parameters for a fetch request, including the URI and path, as well as a selector function to transform the response.
 * @template TReturn - The type of the transformed response data.
 * @template TRequest - The type of the fetch request.
 * @template TResponse - The type of the fetch response.
 */
export type FetchRequestInit<
  TReturn = unknown,
  TRequest = FetchRequest,
  TResponse = FetchResponse<TReturn>,
> = Omit<TRequest, 'uri' | 'path'> & {
  /** response selector function */
  selector?: ResponseSelector<TReturn, TResponse>;
};

/**
 * Represents the parameters for a fetch request, including the URI and path, as well as a selector function to transform the response.
 *
 * @template TReturn - The type of the transformed response data.
 * @template TRequest - The type of the fetch request.
 * @template TResponse - The type of the fetch response.
 */
export type ClientRequestInit<T extends IHttpClient, TReturn = unknown> =
  T extends IHttpClient<infer TRequest, infer TResponse>
    ? FetchRequestInit<TReturn, TRequest, TResponse>
    : never;

/**
 * Represents the available execution methods for an HTTP client.
 */
export type ExecutionMethod = 'fetch' | 'fetch$' | 'json' | 'json$';

/**
 * Represents the type of the parameters for the execution methods of an `IHttpClient` instance.
 *
 * @template TMethod - The execution method of the `IHttpClient` instance, e.g. 'fetch', 'json'.
 * @template TClient - The type of the `IHttpClient` instance.
 */
export type ExecutionMethodParameters<
  TMethod extends ExecutionMethod = 'fetch',
  TClient extends IHttpClient = IHttpClient,
> = Parameters<TClient[TMethod]>;

/**
 * Represents the type of the return value for the execution methods of an `IHttpClient` instance.
 *
 * @template TMethod - The execution method of the `IHttpClient` instance, e.g. 'fetch', 'json'.
 * @template TClient - The type of the `IHttpClient` instance.
 */
export type ExecutionResponse<
  TMethod extends ExecutionMethod = 'fetch',
  TClient extends IHttpClient = IHttpClient,
> = ReturnType<TClient[TMethod]>;

/**
 * @template TRequest request arguments @see {@link https://developer.mozilla.org/en-US/docs/Web/API/request|request}
 * @template TResponse request arguments @see {@link https://developer.mozilla.org/en-US/docs/Web/API/response|response}
 */
export interface IHttpClient<TRequest extends FetchRequest = FetchRequest, TResponse = Response> {
  uri: string;
  /**
   * A pre-processor for requests made by the `IHttpClient` interface.
   * This handler can be used to modify the request before it is sent, such as adding headers, authentication, or other transformations.
   */
  readonly requestHandler: IHttpRequestHandler<TRequest>;

  /**
   * A post-processor for responses received by the `IHttpClient` interface.
   * This handler can be used to transform the response data after it is received, such as parsing JSON, handling errors, or other transformations.
   */
  readonly responseHandler: IHttpResponseHandler<TResponse>;

  /**
   * Observable stream of requests made by the `IHttpClient` interface.
   * This stream can be used to observe and potentially modify the requests before they are sent.
   */
  readonly request$: Observable<TRequest>;

  /**
   * Observable stream of responses received by the `IHttpClient` interface.
   * This stream can be used to observe and potentially handle the responses after they are received.
   */
  readonly response$: Observable<TResponse>;

  /**
   * Fetch a resource as an observable stream.
   * This method simplifies the execution of a request and returns an observable stream of the response.
   * The request will not be executed until the observable is subscribed to.
   *
   * @template T - The expected response type.
   * @param path - The path to fetch the resource from.
   * @param init - Optional request initialization options.
   * @returns An observable stream of the response.
   *
   * @see {@link https://rxjs.dev/api/fetch/fromFetch|RxJS fromFetch}
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch|fetch}
   */
  fetch$<T = TResponse>(
    path: string,
    init?: FetchRequestInit<T, TRequest, TResponse>,
  ): StreamResponse<T>;

  /**
   * Fetch a resource as a promise.
   *
   * @template T - The expected response type.
   * @param path - The path to fetch the resource from.
   * @param init - Optional request initialization options.
   * @returns A promise that resolves to the fetched resource.
   *
   * @see {@link IHttpClient.fetch$}
   */
  fetch<T = TResponse>(path: string, init?: FetchRequestInit<T, TRequest, TResponse>): Promise<T>;

  /** @deprecated use {@link IHttpClient.fetch} */
  fetchAsync<T = TResponse>(
    path: string,
    args?: FetchRequestInit<T, TRequest, TResponse>,
  ): Promise<T>;

  /**
   * Fetches a resource as an observable stream.
   * This method simplifies the execution of a request and returns an observable stream of the response.
   * The request will not be executed until the observable is subscribed to.
   *
   * @template T - The expected response type.
   * @param path - The path to fetch the resource from.
   * @param init - Optional request initialization options, including the request body, headers, and response type.
   * @returns An observable stream of the fetched resource.
   *
   * @see {@link IHttpClient.fetch$}
   */
  json$<T = unknown>(
    path: string,
    init?: FetchRequestInit<T, JsonRequest<TRequest>, TResponse>,
  ): StreamResponse<T>;

  /**
   * Fetches a resource as a promise and returns the response as a JSON object.
   *
   * @template T - The expected response type.
   * @param path - The path to fetch the resource from.
   * @param init - Optional request initialization options, including the request body, headers, and response type.
   * @returns A promise that resolves to the fetched resource as a JSON object.
   *
   * @see {@link IHttpClient.fetch} for fetching resources as an observable stream.
   */
  json<T = unknown>(
    path: string,
    init?: FetchRequestInit<T, JsonRequest<TRequest>, TResponse>,
  ): Promise<T>;

  /** @deprecated */
  jsonAsync<T = unknown>(
    path: string,
    args?: FetchRequestInit<T, JsonRequest<TRequest>, TResponse>,
  ): Promise<T>;

  /**
   * Fetches a blob resource from the specified path and returns a Promise that resolves to the fetched blob data.
   *
   * @param path - The path to fetch the blob from.
   * @param args - Optional arguments for the fetch request, including the request body, headers, and response type.
   * @returns A Promise that resolves to the fetched blob data.
   */
  blob<T = BlobResult>(
    path: string,
    args?: FetchRequestInit<T, JsonRequest<TRequest>, TResponse>,
  ): Promise<T>;

  /**
   * Fetches a blob from the specified path and returns a stream response.
   *
   * @param path - The path to fetch the blob from.
   * @param args - Optional arguments for the fetch request, including the request body, headers, and response type.
   * @returns A stream response containing the fetched blob.
   */
  blob$<T = BlobResult>(
    path: string,
    args?: FetchRequestInit<T, JsonRequest<TRequest>, TResponse>,
  ): StreamResponse<T>;

  /**
   * Abort all ongoing requests for the current client.
   */
  abort(): void;
}
