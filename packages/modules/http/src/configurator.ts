import {
  capitalizeRequestMethodOperator,
  requestValidationOperator,
  HttpRequestHandler,
} from './lib/operators';

import type { FetchRequest, IHttpClient } from './lib/client';
import type { IHttpRequestHandler, IHttpResponseHandler } from './lib/operators';

/**
 * Represents the options for constructing an `IHttpClient` instance.
 *
 * @template TInit - The type of the initial request object used by the `IHttpClient` instance.
 * @template TResponse - The type of the response object used by the `IHttpClient` instance.
 * @property {IHttpRequestHandler<TInit>} requestHandler - The request handler to be used by the `IHttpClient` instance.
 * @property {IHttpResponseHandler<TResponse>} [responseHandler] - The response handler to be used by the `IHttpClient` instance.
 */
interface HttpClientConstructorOptions<TInit extends FetchRequest, TResponse = Response> {
  requestHandler: IHttpRequestHandler<TInit>;
  responseHandler?: IHttpResponseHandler<TResponse>;
}

/**
 * Represents a constructor for an `IHttpClient` instance.
 *
 * @template TClient - The type of the `IHttpClient` instance to be constructed.
 * @param uri - The base URI for the `IHttpClient` instance.
 * @param options - The options for constructing the `IHttpClient` instance, including the request handler.
 * @returns A new instance of the `TClient` type.
 */
interface HttpClientConstructor<TClient extends IHttpClient> {
  new (
    uri: string,
    options: HttpClientConstructorOptions<
      HttpClientRequestInitType<TClient>,
      HttpClientResponseType<TClient>
    >,
  ): TClient;
}

/**
 * Configures how the provider creates a named `IHttpClient` instance.
 *
 * Use these options to define a base URL, MSAL scopes, shared request or response handlers,
 * a custom client constructor, or per-instance setup through `onCreate`.
 *
 * @template TClient - The client type created from this configuration.
 */
export interface HttpClientOptions<TClient extends IHttpClient = IHttpClient> {
  /** The base URI for the `IHttpClient` instance. */
  baseUri?: string;

  /** The default scopes to be used by the `IHttpClient` instance. */
  defaultScopes?: string[];

  /** The constructor for the `TClient` type. */
  ctor?: HttpClientConstructor<TClient>;

  /** A callback function that is called when a new `TClient` instance is created. */
  onCreate?: (client: TClient) => void;

  /** The request handler to be used by the `IHttpClient` instance. */
  requestHandler?: IHttpRequestHandler<HttpClientRequestInitType<TClient>>;

  /** The response handler to be used by the `IHttpClient` instance. */
  responseHandler?: IHttpResponseHandler<HttpClientResponseType<TClient>>;
}

/**
 * Utility type that extracts the request init type from an `IHttpClient` implementation.
 * This is useful for ensuring type safety when configuring an `IHttpClient` instance.
 *
 * @template T - The type of the `IHttpClient` implementation.
 * @returns The request init type for the `IHttpClient` implementation.
 */
export type HttpClientRequestInitType<T extends IHttpClient> =
  T extends IHttpClient<infer U> ? U : never;

/**
 * Utility type that extracts the response type from an `IHttpClient` implementation.
 * This is useful for ensuring type safety when configuring response handlers for an `IHttpClient` instance.
 *
 * @template T - The type of the `IHttpClient` implementation.
 * @returns The response type for the `IHttpClient` implementation.
 */
export type HttpClientResponseType<T extends IHttpClient> =
  T extends IHttpClient<infer _TRequest, infer TResponse> ? TResponse : never;

/**
 * Registers and looks up named HTTP client configurations for the HTTP module.
 *
 * Each named configuration can later be turned into a fresh client instance by the provider.
 *
 * @template TClient - The base client type the provider creates.
 */
export interface IHttpClientConfigurator<TClient extends IHttpClient = IHttpClient> {
  readonly clients: Record<string, HttpClientOptions<TClient>>;
  readonly defaultHttpClientCtor: HttpClientConstructor<TClient>;
  readonly defaultHttpRequestHandler: IHttpRequestHandler<HttpClientRequestInitType<TClient>>;

  /**
   * Registers or updates a named client configuration.
   * @param name - The client key used later with `createClient(name)`.
   * @param args - The configuration used when creating a client instance.
   * @returns The configurator so registrations can be chained.
   * @example
   * ```ts
   * configurator.http.configureClient('catalog', {
   *   baseUri: 'https://api.example.com',
   *   defaultScopes: ['api://catalog-api/.default'],
   * });
   * ```
   */
  configureClient<T extends TClient>(
    name: string,
    args: HttpClientOptions<T>,
  ): IHttpClientConfigurator<TClient>;

  /**
   * Registers a named client with only a base URI.
   * @param name - The client key used later with `createClient(name)`.
   * @param uri - The base endpoint for the client.
   * @returns The configurator so registrations can be chained.
   */
  configureClient(name: string, uri: string): IHttpClientConfigurator<TClient>;

  /**
   * Registers a named client using only an `onCreate` callback.
   * @param name - The client key used later with `createClient(name)`.
   * @param onCreate - The callback that runs for every created client instance.
   * @returns The configurator so registrations can be chained.
   * @example
   * ```ts
   * configurator.http.configureClient('catalog', (client) => {
   *   client.requestHandler.add('logger', (request) => console.log(request));
   * });
   * ```
   */
  configureClient<T extends TClient>(
    name: string,
    onCreate: (client: T) => void,
  ): HttpClientConfigurator<TClient>;

  /**
   * Checks whether a named client configuration exists.
   * @param name - The client key to check.
   * @returns `true` when a configuration exists for the key.
   */
  hasClient(name: string): boolean;
}

/** @inheritdoc */
export class HttpClientConfigurator<TClient extends IHttpClient>
  implements IHttpClientConfigurator<TClient>
{
  protected _clients: Record<string, HttpClientOptions<TClient>> = {};

  /** Gets a shallow clone of all named client configurations. */
  public get clients(): Record<string, HttpClientOptions<TClient>> {
    return { ...this._clients };
  }

  /** Default constructor used when a client configuration does not provide `ctor`. */
  readonly defaultHttpClientCtor: HttpClientConstructor<TClient>;

  /** Default request handler pipeline cloned into each created client instance. */
  readonly defaultHttpRequestHandler = new HttpRequestHandler<HttpClientRequestInitType<TClient>>({
    // convert all request methods to uppercase
    'capitalize-method': capitalizeRequestMethodOperator(),
    // validate the request object
    'request-validation': requestValidationOperator(),
  });

  /**
   * Creates a configurator with the default client constructor.
   * @param client - The default client constructor used when `ctor` is not configured per client.
   */
  constructor(client: HttpClientConstructor<TClient>) {
    this.defaultHttpClientCtor = client;
  }

  /** @inheritdoc */
  hasClient(name: string): boolean {
    return Object.keys(this._clients).includes(name);
  }

  /** @inheritdoc */
  configureClient<T extends TClient>(
    name: string,
    args: string | HttpClientOptions<T> | HttpClientOptions<T>['onCreate'],
  ): HttpClientConfigurator<TClient> {
    const argFn = typeof args === 'string' ? ({ baseUri: args } as HttpClientOptions<T>) : args;
    const options = typeof argFn === 'function' ? { onCreate: argFn } : argFn;
    this._clients[name] = {
      ...this._clients[name],
      ...(options as unknown as HttpClientOptions<TClient>),
    };
    return this;
  }
}

export default HttpClientConfigurator;
