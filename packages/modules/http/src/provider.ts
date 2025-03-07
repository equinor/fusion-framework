import type { HttpClient } from './lib/client';
import type {
  HttpClientOptions,
  HttpClientRequestInitType,
  IHttpClientConfigurator,
} from './configurator';

import type { IHttpRequestHandler } from './lib/operators';
import type { IHttpClient } from './lib/client';

/**
 * Exception thrown when a client cannot be found.
 *
 * This error is typically used to indicate that a requested client instance
 * does not exist or cannot be located within the current context.
 *
 * @extends {Error}
 */
export class ClientNotFoundException extends Error {}

export interface IHttpClientProvider<TClient extends IHttpClient = IHttpClient> {
  /**
   * The default HTTP request handler used by the HttpClientProvider.
   * This handler is responsible for executing HTTP requests using the configured HttpClient.
   */
  readonly defaultHttpRequestHandler: IHttpRequestHandler<HttpClientRequestInitType<TClient>>;

  /**
   * Checks if a client is configured with the given key.
   * @param key - The key of the client to check.
   * @returns `true` if a client is configured with the given key, `false` otherwise.
   */
  hasClient(key: string): boolean;

  /**
   * Creates a new HTTP client instance with the specified key.
   * @param key - The key of the HTTP client to create.
   * @returns The created HTTP client instance.
   */
  createClient(key: string): TClient;
  createClient(key: HttpClientOptions<TClient>): TClient;

  /**
   * Class cast creation of custom client
   * @example
   * ```ts
   * config.http.configureClient('foobar', (client) => {
   *   client.ctor = MyClient;
   *   client.uri = 'https://foobar.com';
   * });
   */
  createCustomClient<T extends HttpClient>(key: string): T;
}

/**
 * Checks if a given string is a valid URL.
 * @param url - The string to check for a valid URL.
 * @returns `true` if the input string is a valid URL, `false` otherwise.
 */
const isURL = (url: string) => {
  const pattern = new RegExp(
    '^(https?:\\/\\/)?' + // protocol
      '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.?)+[a-z]{2,}|' + // domain name
      '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
      '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
      '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
      '(\\#[-a-z\\d_]*)?$',
    'i',
  ); // fragment locator
  return pattern.test(url);
};

/**
 * The `HttpClientProvider` class is responsible for managing HTTP client instances and their configuration.
 * It provides methods to check if a client is configured, create new client instances, and create custom client instances.
 */
export class HttpClientProvider<TClient extends IHttpClient = IHttpClient>
  implements IHttpClientProvider<TClient>
{
  /**
   * Gets the default HTTP request handler for the HTTP client provider.
   * @returns The default HTTP request handler.
   */
  get defaultHttpRequestHandler(): IHttpRequestHandler<HttpClientRequestInitType<TClient>> {
    return this.config.defaultHttpRequestHandler;
  }

  constructor(protected config: IHttpClientConfigurator<TClient>) {}

  /**
   * Checks if a client with the given key is configured in the `HttpClientProvider`.
   * @param key - The key of the HTTP client to check.
   * @returns `true` if a client with the given key is configured, `false` otherwise.
   */
  public hasClient(key: string): boolean {
    return Object.keys(this.config.clients).includes(key);
  }

  /**
   * Creates a new HTTP client instance with the specified configuration.
   *
   * @param keyOrConfig - The key or configuration object for the HTTP client.
   * @returns The created HTTP client instance.
   *
   * @remarks
   * This method resolves the configuration for the HTTP client based on the provided `keyOrConfig` parameter.
   * If a string is provided, it is treated as the key for a pre-configured client in the `HttpClientProvider`.
   * If an `HttpClientOptions` object is provided, it is used as the configuration for the new client instance.
   *
   * The method sets up the HTTP client with the following options:
   * - `baseUri`: The base URI for the HTTP client.
   * - `defaultScopes`: The default scopes to be used for authentication.
   * - `onCreate`: An optional callback function that is called when the client instance is created.
   * - `ctor`: The constructor function for the HTTP client, defaulting to the configured `defaultHttpClientCtor`.
   * - `requestHandler`: The HTTP request handler to be used by the client, defaulting to the `defaultHttpRequestHandler`.
   *
   * The created HTTP client instance is returned.
   */
  public createClient(keyOrConfig: string | HttpClientOptions<TClient>): TClient {
    const config = this._resolveConfig(keyOrConfig);
    const {
      baseUri,
      defaultScopes = [],
      onCreate,
      ctor = this.config.defaultHttpClientCtor,
      requestHandler = this.defaultHttpRequestHandler,
    } = config as HttpClientOptions<TClient>;
    const options = { requestHandler };
    const instance = new ctor(baseUri || '', options) as TClient;
    Object.assign(instance, { defaultScopes });
    onCreate?.(instance as TClient);
    return instance as TClient;
  }

  /**
   * Creates a new HTTP client instance with the specified configuration.
   *
   * @param key - The key of the pre-configured HTTP client to create.
   * @returns The created HTTP client instance, cast to the specified type `T`.
   *
   * @remarks
   * This method delegates to the `createClient` method, but casts the returned
   * instance to the specified type `T`. This can be useful when you need to
   * work with a specific HTTP client implementation, but the `HttpClientProvider`
   * is configured to use a different implementation.
   */
  public createCustomClient<T extends HttpClient>(key: string): T {
    return this.createClient(key) as unknown as T;
  }

  /**
   * Resolves the configuration for an HTTP client based on the provided `keyOrConfig` parameter.
   *
   * If a string is provided, it is treated as the key for a pre-configured client in the `HttpClientProvider`.
   * If an `HttpClientOptions` object is provided, it is used as the configuration for the new client instance.
   *
   * @param keyOrConfig - The key or configuration object for the HTTP client.
   * @returns The resolved HTTP client configuration.
   */
  protected _resolveConfig(
    keyOrConfig: string | HttpClientOptions<TClient>,
  ): HttpClientOptions<TClient> {
    if (typeof keyOrConfig === 'string') {
      const config = this.config.clients[keyOrConfig];
      if (!config && isURL(keyOrConfig)) {
        return { baseUri: keyOrConfig };
      } else if (!config) {
        throw new ClientNotFoundException(`No registered http client for key [${keyOrConfig}]`);
      }
      return config;
    }
    return keyOrConfig as HttpClientOptions<TClient>;
  }
}
