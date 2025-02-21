import type {
  ClientRequestInit,
  IHttpClient,
  StreamResponse,
  BlobResult,
} from '@equinor/fusion-framework-module-http/client';

/**
 * A factory function that creates an instance of an HTTP client.
 *
 * @param name - The name of the HTTP client to create.
 * @returns A Promise that resolves to an instance of the HTTP client.
 */
export type ApiClientFactory<TClient extends IHttpClient = IHttpClient> = (
  name: string,
) => Promise<TClient>;

/**
 * Represents the arguments for an API client function.
 *
 * @template TClient - The type of the HTTP client used by the API client.
 * @template TResult - The type of the result returned by the API client.
 * @param path - The path of the API endpoint.
 * @param init - Optional initialization options for the API client request.
 */
export type ApiClientArguments<TClient extends IHttpClient, TResult = unknown> = [
  path: string,
  init?: ClientRequestInit<TClient, TResult>,
];

/**
 * Execute methods on the IHttpClient
 */
export type ClientMethod<T = unknown> = {
  /**
   * Fetch JSON data from a service
   */
  json: Promise<T>;
  /**
   * Fetch JSON data from a service as observable
   */
  json$: StreamResponse<T>;
};

export type ClientDataMethod<T extends BlobResult = BlobResult> = {
  blob: Promise<T>;
  blob$: StreamResponse<T>;
};

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
