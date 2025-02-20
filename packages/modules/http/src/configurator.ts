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
 * @property {IHttpRequestHandler<TInit>} requestHandler - The request handler to be used by the `IHttpClient` instance.
 */
interface HttpClientConstructorOptions<TInit extends FetchRequest> {
  requestHandler: IHttpRequestHandler<TInit>;
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
    options: HttpClientConstructorOptions<HttpClientRequestInitType<TClient>>,
  ): TClient;
}

/**
 * Represents the options for configuring an `IHttpClient` instance.
 *
 * @template TClient - The type of the `IHttpClient` instance to be configured.
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
  responseHandler?: IHttpResponseHandler<HttpClientRequestInitType<TClient>>;
}

/**
 * Utility type that extracts the request init type from an `IHttpClient` implementation.
 * This is useful for ensuring type safety when configuring an `IHttpClient` instance.
 *
 * @template T - The type of the `IHttpClient` implementation.
 * @returns The request init type for the `IHttpClient` implementation.
 */
export type HttpClientRequestInitType<T extends IHttpClient> = T extends IHttpClient<infer U>
  ? U
  : never;

/**
 * Instance for configuring http client
 * @template TClient base type of client that the provider will create
 */
export interface IHttpClientConfigurator<TClient extends IHttpClient = IHttpClient> {
  readonly clients: Record<string, HttpClientOptions<TClient>>;
  readonly defaultHttpClientCtor: HttpClientConstructor<TClient>;
  readonly defaultHttpRequestHandler: IHttpRequestHandler<HttpClientRequestInitType<TClient>>;

  /**
   * Configure a client with arguments
   * @param name name of the client
   * @param args option that are used cor creating a client
   * @example
   * ```ts
   * configurator.http.configureClient('foo',{
   *   baseUri: 'https://foo.bar',
   *   defaultScopes: ['foobar/.default']
   * });
   * ```
   */
  configureClient<T extends TClient>(
    name: string,
    args: HttpClientOptions<T>,
  ): IHttpClientConfigurator<TClient>;

  /**
   * Configure a simple client by name to an endpoint
   * @param name name of the client
   * @param uri base endpoint for the client
   */
  configureClient(name: string, uri: string): IHttpClientConfigurator<TClient>;

  /**
   * Creates a client with callback configuration
   * @param name name of the client
   * @param onCreate callback when a client is created
   * ```ts
   * configurator.http.configureClient('foo',(client) => {
   *   client.requestHandler.add('logger', (request) => console.log(request));
   * });
   * ```
   */
  configureClient<T extends TClient>(
    name: string,
    onCreate: (client: T) => void,
  ): HttpClientConfigurator<TClient>;

  /**
   * Check if there is a configuration for provided name
   */
  hasClient(name: string): boolean;
}

/** @inheritdoc */
export class HttpClientConfigurator<TClient extends IHttpClient>
  implements IHttpClientConfigurator<TClient>
{
  protected _clients: Record<string, HttpClientOptions<TClient>> = {};

  /** Get a clone of all configured clients */
  public get clients(): Record<string, HttpClientOptions<TClient>> {
    return { ...this._clients };
  }

  /** default class for creation of http clients */
  readonly defaultHttpClientCtor: HttpClientConstructor<TClient>;

  /** default request handler for http clients, applied on creation */
  readonly defaultHttpRequestHandler = new HttpRequestHandler<HttpClientRequestInitType<TClient>>({
    // convert all request methods to uppercase
    ['capitalize-method']: capitalizeRequestMethodOperator(),
    // validate the request object
    ['request-validation']: requestValidationOperator(),
  });

  /**
   * Create a instance of http configuration
   * @param client defaultHttpRequestHandler
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
