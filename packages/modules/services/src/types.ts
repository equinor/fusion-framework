import type {
  ClientRequestInit,
  IHttpClient,
  StreamResponse,
  BlobResult,
} from '@equinor/fusion-framework-module-http/client';

/**
 * Factory function that creates a named HTTP client instance.
 *
 * Used by {@link ApiProvider} to resolve service-specific HTTP clients
 * (for example, `'bookmarks'`, `'context'`, `'notification'`, `'people'`).
 * The factory first checks registered HTTP clients, then falls back to
 * service discovery.
 *
 * @template TClient - The HTTP client type to create.
 * @param name - Logical service name used to look up or create the HTTP client.
 * @returns A Promise that resolves to a configured HTTP client instance.
 */
export type ApiClientFactory<TClient extends IHttpClient = IHttpClient> = (
  name: string,
) => Promise<TClient>;

/**
 * Tuple type representing the positional arguments passed to an HTTP client method.
 *
 * Used internally by endpoint generators to build the `[path, init]` pair
 * that the HTTP client's `json()` or `json$()` method expects.
 *
 * @template TClient - The HTTP client type that will execute the request.
 * @template TResult - The expected response body type.
 */
export type ApiClientArguments<TClient extends IHttpClient, TResult = unknown> = [
  path: string,
  init?: ClientRequestInit<TClient, TResult>,
];

/**
 * Maps HTTP client execution methods to their return types.
 *
 * - `json` — returns a `Promise` that resolves with the parsed JSON body.
 * - `json$` — returns an RxJS-style `StreamResponse` observable.
 *
 * All versioned API client methods are generic over `ClientMethod`,
 * allowing callers to choose between promise-based and observable-based
 * consumption.
 *
 * @template T - The expected deserialized response body type.
 */
export type ClientMethod<T = unknown> = {
  /** Fetch JSON data from a service as a promise. */
  json: Promise<T>;
  /** Fetch JSON data from a service as an observable stream. */
  json$: StreamResponse<T>;
};

/**
 * Maps HTTP client binary-data execution methods to their return types.
 *
 * - `blob` — returns a `Promise` that resolves with the binary blob result.
 * - `blob$` — returns an RxJS-style `StreamResponse` observable for the blob.
 *
 * Used by endpoints that return non-JSON data such as profile photos.
 *
 * @template T - The blob result type, defaults to `BlobResult`.
 */
export type ClientDataMethod<T extends BlobResult = BlobResult> = {
  /** Fetch binary data from a service as a promise. */
  blob: Promise<T>;
  /** Fetch binary data from a service as an observable stream. */
  blob$: StreamResponse<T>;
};

/** Union of available client method names (`'json' | 'json$'`). */
export type ClientMethodType = keyof ClientMethod;

/**
 * Utility type that filters the keys of an `AvailableTypes` object to only those
 * whose values are a subset of the `AllowedTypes` string.
 *
 * This can be useful for creating a type that represents a subset of an API's
 * available versions, where the allowed versions are a subset of the total
 * available versions.
 *
 * @example
 * ```typescript
 * enum ApiVersions = {
 *  v1: '1.0'
 *  v2: '2.0'
 *  v3: '3.0'
 * }
 *
 * type Services = {
 *  [ApiVersions.v1]: { request: ApiRequestModel_v1, response: ApiResponseModel_v1 }
 *  [ApiVersions.v2]: { request: ApiRequestModel_v2, response: ApiResponseModel_v2 }
 * }
 *
 * type ApiServiceVersions = keyof Services; // '1.0' | '2.0'
 * type AllowedApiVersions = FilterAllowApiVersions<ApiVersions, ApiServiceVersions> // ApiVersions.v1 | 'v1' | ApiVersions.v2 | v2'
 *
 * const execute<TVersion extends AllowedApiVersions>(
 *   version: TVersion,
 *   args: Services[TVersion]['request']
 * ): Services[TVersion]['response'] {
 *      const apiVersion = version in ApiVersion ? ApiVersion[version] : version;
 *      switch (apiVersion) {
 *          case ApiVersion.v1:
 *          case ApiVersion.v2:
 *              return fetch(args);
 *      }
 *     throw new Error('Invalid version');
 * }
 *
 * execute('v1', { id: '123' }); // OK
 * execute('v3', { id: '123' }); // Error
 * ```
 *
 * @template TAvailableTypes - An object type that maps string keys to string values,
 *   representing the available API versions.
 * @template TAllowedTypes - A string union type representing the allowed API versions.
 * @returns A string union type containing the keys from `AvailableTypes` whose
 *   values are a subset of `AllowedTypes`.
 */
export type FilterAllowedApiVersions<
  TAvailableTypes extends Record<string, string>,
  TAllowedTypes extends string | number | symbol = keyof TAvailableTypes,
> = {
  [K in keyof TAvailableTypes]: TAvailableTypes extends Record<K, infer V>
    ? K extends TAllowedTypes
      ? K | V
      : V extends TAllowedTypes
        ? V | K
        : never
    : never;
}[keyof TAvailableTypes];

/**
 * Extracts the API version from a set of available types, based on a list of allowed types.
 *
 * @template TAvailableTypes - An object mapping API version strings to their corresponding types.
 * @template TAllowedTypes - A list of allowed API version strings.
 * @template TVersion - The API version to extract.
 * @returns The API version type if it is available and allowed, otherwise `never`.
 */
export type ExtractApiVersion<
  TAvailableTypes extends Record<string, string>,
  TVersion extends string,
  TAllowedTypes extends string | number | symbol = FilterAllowedApiVersions<TAvailableTypes>,
> = TVersion extends keyof TAvailableTypes
  ? TAvailableTypes[TVersion]
  : TVersion extends TAllowedTypes
    ? TVersion
    : never;
