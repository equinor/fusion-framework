import type { z } from 'zod';

import type {
  ClientRequestInit,
  IHttpClient,
  StreamResponse,
} from '@equinor/fusion-framework-module-http/client';

/**
 * The argument and response schemas one concrete API version publishes.
 *
 * Pairing the two in a single entry is what makes the version a *single*
 * discriminator: an endpoint cannot pick version 1.0 arguments and version 2.0
 * response validation, because both are read from the same contract entry.
 */
export type ApiVersionSchemas = {
  /** Schema validating the arguments this version accepts. */
  args: z.ZodType;
  /** Schema validating the response body this version publishes. */
  response: z.ZodType;
};

/**
 * An endpoint's version contract: concrete API version → the schemas it publishes.
 *
 * Keys are the *concrete* version values (`'1.0'`), never the aliases (`'v1'`),
 * so an alias must be resolved before the contract can be indexed.
 *
 * @example
 * ```ts
 * const VersionContract = {
 *   [ApiVersion.v1]: { args: z.object({ roleIdentifier: z.string() }), response: ApiRoleSchemaV1 },
 * } as const satisfies ApiVersionContract;
 * ```
 */
export type ApiVersionContract = Record<string, ApiVersionSchemas>;

/**
 * Projects a version contract onto its argument schemas, keyed by concrete version.
 *
 * The projection is what keeps a version lookup resolvable while the version is
 * still generic: a single indexed access into a mapped type reduces, whereas the
 * nested `TContract[TVersion]['args']` access stays deferred and breaks inference.
 *
 * @template TContract - The endpoint's version contract.
 */
export type ApiVersionArgSchemas<TContract extends ApiVersionContract> = {
  [TVersion in keyof TContract]: TContract[TVersion]['args'];
};

/**
 * Projects a version contract onto its response schemas, keyed by concrete version.
 *
 * @template TContract - The endpoint's version contract.
 */
export type ApiVersionResponseSchemas<TContract extends ApiVersionContract> = {
  [TVersion in keyof TContract]: TContract[TVersion]['response'];
};

/**
 * The arguments a caller passes for a specific version of an endpoint.
 *
 * Resolves through the contract entry for `TVersion` only, so versions never
 * union their argument fields together.
 *
 * @template TContract - The endpoint's version contract.
 * @template TVersion - Concrete API version to resolve.
 */
export type VersionedArgs<
  TContract extends ApiVersionContract,
  TVersion extends keyof TContract,
> = z.input<ApiVersionArgSchemas<TContract>[TVersion]>;

/**
 * The arguments of a specific version *after* the contract schema has parsed them.
 *
 * Request builders receive parsed arguments, so defaults and transforms applied
 * by the schema are already in place.
 *
 * @template TContract - The endpoint's version contract.
 * @template TVersion - Concrete API version to resolve.
 */
export type VersionedParsedArgs<
  TContract extends ApiVersionContract,
  TVersion extends keyof TContract,
> = z.infer<ApiVersionArgSchemas<TContract>[TVersion]>;

/**
 * The response body a specific version of an endpoint returns.
 *
 * @template TContract - The endpoint's version contract.
 * @template TVersion - Concrete API version to resolve.
 */
export type VersionedResponse<
  TContract extends ApiVersionContract,
  TVersion extends keyof TContract,
> = z.infer<ApiVersionResponseSchemas<TContract>[TVersion]>;

/**
 * Tuple type representing the positional arguments passed to an HTTP client method.
 *
 * Endpoint functions in this package build the `[path, init]` pair that the HTTP
 * client's `json()` or `json$()` method expects, so this type describes the
 * hand-off between a generated request and the transport that executes it.
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
 * Every endpoint function is generic over `ClientMethod`, so a caller chooses
 * between promise-based and observable-based consumption at the call site
 * without losing response typing.
 *
 * @template T - The expected deserialized response body type.
 */
export type ClientMethod<T = unknown> = {
  /** Fetch JSON data from a service as a promise. */
  json: Promise<T>;
  /** Fetch JSON data from a service as an observable stream. */
  json$: StreamResponse<T>;
};

/** Union of available client method names (`'json' | 'json$'`). */
export type ClientMethodType = keyof ClientMethod;

/**
 * Every identifier that names a single API version.
 *
 * A version is nameable three ways — by its key (`'v1'`), by the enum member
 * (`ApiVersion.v1`), and by the raw version string (`'1.0'`). String enum members
 * are nominal in TypeScript, so the raw string has to be spelled out through a
 * template literal or callers could not pass `'1.0'` at all.
 *
 * @template TKey - The version key.
 * @template TValue - The concrete version the key names.
 */
type ApiVersionAliases<TKey, TValue extends string> = (TKey & string) | TValue | `${TValue}`;

/**
 * Version identifiers an endpoint accepts, restricted to the versions it publishes.
 *
 * Use it to describe the version parameter of an endpoint, so callers may pass the
 * version key (`'v1'`), the enum member (`ApiVersion.v1`), or the raw version
 * value (`'1.0'`) — all three name the same contract entry.
 *
 * @example
 * ```typescript
 * enum ApiVersion {
 *   v1 = '1.0',
 *   v2 = '2.0',
 * }
 *
 * type AllowedVersions = FilterAllowedApiVersions<typeof ApiVersion, ApiVersion.v1>;
 * // 'v1' | ApiVersion.v1 | '1.0'
 * ```
 *
 * @template TAvailableTypes - An object type that maps version keys to version values.
 * @template TAllowedTypes - Keys or values of the versions the endpoint publishes.
 * @returns A union of every identifier naming one of the allowed versions.
 */
export type FilterAllowedApiVersions<
  TAvailableTypes extends Record<string, string>,
  TAllowedTypes extends string | number | symbol = keyof TAvailableTypes,
> = {
  [K in keyof TAvailableTypes]: K extends TAllowedTypes
    ? ApiVersionAliases<K, TAvailableTypes[K]>
    : TAvailableTypes[K] extends TAllowedTypes
      ? ApiVersionAliases<K, TAvailableTypes[K]>
      : never;
}[keyof TAvailableTypes];

/**
 * Maps a version identifier that is not a key back onto the version it names.
 *
 * Both the enum member and its raw string resolve to the enum member, so a
 * contract lookup gets the same key whichever spelling the caller used.
 *
 * @template TAvailableTypes - An object mapping version keys to version values.
 * @template TVersion - The identifier to resolve.
 */
type ResolveApiVersionValue<
  TAvailableTypes extends Record<string, string>,
  TVersion extends string,
> = {
  [K in keyof TAvailableTypes]: TVersion extends TAvailableTypes[K] | `${TAvailableTypes[K]}`
    ? TAvailableTypes[K]
    : never;
}[keyof TAvailableTypes];

/**
 * Resolves a version identifier to the concrete API version it names.
 *
 * This is the type-level half of the version discriminator: `'v1'`, `'1.0'`, and
 * `ApiVersion.v1` all resolve to the same concrete version, which then indexes an
 * endpoint's version contract for both its argument and response types.
 *
 * @template TAvailableTypes - An object mapping API version keys to version strings.
 * @template TVersion - The API version identifier to resolve.
 * @template TAllowedTypes - The allowed API version identifiers.
 * @returns The resolved API version if it is available and allowed, otherwise `never`.
 */
export type ExtractApiVersion<
  TAvailableTypes extends Record<string, string>,
  TVersion extends string,
  TAllowedTypes extends string | number | symbol = FilterAllowedApiVersions<TAvailableTypes>,
> = TVersion extends keyof TAvailableTypes
  ? TAvailableTypes[TVersion]
  : TVersion extends TAllowedTypes
    ? ResolveApiVersionValue<TAvailableTypes, TVersion>
    : never;
