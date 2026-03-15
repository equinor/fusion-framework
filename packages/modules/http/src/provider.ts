import type { HttpClient } from './lib/client';
import type {
  HttpClientOptions,
  HttpClientRequestInitType,
  IHttpClientConfigurator,
} from './configurator';

import type { IHttpRequestHandler } from './lib/operators';
import type { IHttpClient } from './lib/client';
import { BaseModuleProvider } from '@equinor/fusion-framework-module/provider';
import { version } from './version';

/**
 * Thrown when `createClient(name)` is called with an unknown client key.
 *
 * This is only used when the provided string is neither a registered client name
 * nor an absolute `http:` or `https:` URL.
 */
export class ClientNotFoundException extends Error {}

/**
 * Creates fresh HTTP client instances from named or ad-hoc configuration.
 *
 * A provider can create clients from registered names, inline `HttpClientOptions`,
 * or absolute URLs treated as ad-hoc `baseUri` values.
 */
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
   * Creates a client instance and casts it to a custom HTTP client type.
   *
   * This is most useful when the named client configuration uses a custom `ctor`
   * that extends `HttpClient` with domain-specific methods.
   * @example
   * ```ts
   * config.http.configureClient('foobar', {
   *   ctor: MyClient,
   *   baseUri: 'https://foobar.com',
   * });
   * ```
   */
  createCustomClient<T extends HttpClient>(key: string): T;
}

/** URL protocols accepted as valid ad-hoc base URIs. */
const SUPPORTED_PROTOCOLS = ['http:', 'https:', 'ws:', 'wss:'] as const;

/**
 * Checks if a given string is a valid absolute URL with a supported protocol.
 * @param url - The string to check.
 * @returns `true` when the string uses one of {@link SUPPORTED_PROTOCOLS}.
 */
const isURL = (url: string): boolean => {
  try {
    const parsed = new URL(url);
    return (SUPPORTED_PROTOCOLS as readonly string[]).includes(parsed.protocol);
  } catch {
    return false;
  }
};

/**
 * Heuristic check for strings that look like a bare hostname or URL without a
 * protocol prefix (e.g. `api.example.com` or `api.example.com/v1`).
 *
 * Used to emit a deprecation warning when callers rely on the old (pre-patch)
 * behaviour that accepted protocol-less URLs.
 */
const looksLikeURL = (value: string): boolean =>
  !value.includes(' ') && /^[a-z\d]([a-z\d-]*\.)+[a-z]{2,}/i.test(value);

/**
 * The `HttpClientProvider` class is responsible for managing HTTP client instances and their configuration.
 * It provides methods to check if a client is configured, create new client instances, and create custom client instances.
 */
export class HttpClientProvider<TClient extends IHttpClient = IHttpClient>
  extends BaseModuleProvider<IHttpClientConfigurator<TClient>>
  implements IHttpClientProvider<TClient>
{
  /**
   * Gets the default HTTP request handler for the HTTP client provider.
   * @returns The default HTTP request handler.
   */
  get defaultHttpRequestHandler(): IHttpRequestHandler<HttpClientRequestInitType<TClient>> {
    return this.config.defaultHttpRequestHandler;
  }

  constructor(protected config: IHttpClientConfigurator<TClient>) {
    super({
      version,
      config,
    });
  }

  /**
   * Checks if a client with the given key is configured in the `HttpClientProvider`.
   * @param key - The key of the HTTP client to check.
   * @returns `true` if a client with the given key is configured, `false` otherwise.
   */
  public hasClient(key: string): boolean {
    return Object.keys(this.config.clients).includes(key);
  }

  /**
   * Creates a fresh HTTP client instance from a named or ad-hoc configuration.
   *
   * @param keyOrConfig - The key or configuration object for the HTTP client.
   * @returns The created HTTP client instance.
   *
   * @remarks
   * This method resolves the configuration for the HTTP client based on the provided `keyOrConfig` parameter.
   * If a string is provided, it is treated as the key for a pre-configured client in the `HttpClientProvider`.
   * If an `HttpClientOptions` object is provided, it is used as the configuration for the new client instance.
   *
   * The method applies `baseUri`, `defaultScopes`, `requestHandler`, `responseHandler`,
   * a custom `ctor` when configured, and finally runs `onCreate` for the newly created instance.
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
      responseHandler,
    } = config as HttpClientOptions<TClient>;
    const options = { requestHandler, responseHandler };
    const instance = new ctor(baseUri || '', options) as TClient;
    Object.assign(instance, { defaultScopes });
    onCreate?.(instance as TClient);
    return instance as TClient;
  }

  /**
   * Creates a client instance and returns it as the requested custom client type.
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
   * If a string is provided, it is treated as either a pre-configured client key or,
   * when it is an absolute `http:` or `https:` URL, as an ad-hoc `baseUri`.
   * If an `HttpClientOptions` object is provided, it is used directly as the configuration for the new client instance.
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
      } else if (!config && looksLikeURL(keyOrConfig)) {
        console.warn(
          `[HttpClientProvider] "${keyOrConfig}" looks like a URL but is missing the http:// or https:// protocol. ` +
            `Treating it as "https://${keyOrConfig}". ` +
            `Pass a fully-qualified URL to silence this warning.`,
        );
        return { baseUri: `https://${keyOrConfig}` };
      } else if (!config) {
        throw new ClientNotFoundException(`No registered http client for key [${keyOrConfig}]`);
      }
      return config;
    }
    return keyOrConfig as HttpClientOptions<TClient>;
  }
}
