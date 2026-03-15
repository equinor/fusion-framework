import type { IHttpClient, ClientRequestInit } from '@equinor/fusion-framework-module-http/client';

import { ApiVersion, type ApiContextEntity, type ClientMethod } from '..';

export { ApiClientArguments, ClientMethod } from '..';

/** Arguments for fetching a single context in API v1. */
type GetContextArgs_v1 = {
  /** The unique context identifier. */
  id: string;
};

type GetContextArgs_v2 = GetContextArgs_v1;

type GetContextArgsTypes = {
  [ApiVersion.v1]: GetContextArgs_v1;
  [ApiVersion.v2]: GetContextArgs_v2;
};

/**
 * Version-aware argument type for the get-context endpoint.
 *
 * @template T - API version key.
 */
export type GetContextArgs<T extends string> = T extends keyof typeof ApiVersion
  ? GetContextArgsTypes[(typeof ApiVersion)[T]]
  : unknown;

type GetContextResponseTypes = {
  [ApiVersion.v1]: ApiContextEntity<ApiVersion.v1>;
  [ApiVersion.v2]: ApiContextEntity<ApiVersion.v2>;
};

/**
 * Version-aware response type for the get-context endpoint.
 *
 * @template T - API version key.
 */
export type GetContextResponse<T> = T extends keyof typeof ApiVersion
  ? GetContextResponseTypes[(typeof ApiVersion)[T]]
  : unknown;

/**
 * Function signature for the get-context endpoint.
 *
 * @template TVersion - API version key.
 * @template TMethod - Client execution method.
 * @template TClient - HTTP client type.
 * @template TResult - Expected response type.
 */
export type GetContextFn<
  TVersion extends string = keyof typeof ApiVersion,
  TMethod extends keyof ClientMethod<unknown> = keyof ClientMethod<unknown>,
  TClient extends IHttpClient = IHttpClient,
  TResult = GetContextResponse<TVersion>,
> = (
  args: GetContextArgs<TVersion>,
  init?: ClientRequestInit<TClient, TResult>,
) => GetContextResult<TVersion, TMethod, TResult>;

/**
 * Result type for the get-context endpoint, derived from `ClientMethod`.
 *
 * @template TVersion - API version key.
 * @template TMethod - Client execution method.
 * @template TResult - Expected response type.
 */
export type GetContextResult<
  TVersion extends string = keyof typeof ApiVersion,
  TMethod extends keyof ClientMethod<unknown> = keyof ClientMethod<unknown>,
  TResult = GetContextResponse<TVersion>,
> = ClientMethod<TResult>[TMethod];
