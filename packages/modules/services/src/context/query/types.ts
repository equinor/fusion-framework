import type { IHttpClient, ClientRequestInit } from '@equinor/fusion-framework-module-http/client';

import { ApiVersion, type ApiContextEntity, type ClientMethod } from '..';

export { ApiClientArguments, ClientMethod } from '..';

/**
 * OData filter parameters for context queries.
 *
 * Used to narrow results by context type or external identifier.
 */
export type QueryContextOdataFilter = {
  type?: string[];
  externalId?: string;
};

/**
 * Structured OData query parameters for context search.
 *
 * Allows combining free-text search with type or external-ID filters.
 */
export type QueryContextOdataParameters = {
  search?: string;
  filter?: QueryContextOdataFilter;
};

type QueryContextArgs_v1 = {
  query: string | QueryContextOdataParameters;
  includeDeleted?: boolean;
};

type QueryContextArgs_v2 = QueryContextArgs_v1;

type SearchContextArgTypes = {
  [ApiVersion.v1]: QueryContextArgs_v1;
  [ApiVersion.v2]: QueryContextArgs_v2;
};

/**
 * Version-aware argument type for the context query endpoint.
 *
 * @template T - API version key.
 */
export type QueryContextArgs<T> = T extends keyof typeof ApiVersion
  ? SearchContextArgTypes[(typeof ApiVersion)[T]]
  : { query: { search: string } };

type QueryContextResponseTypes = {
  [ApiVersion.v1]: Array<ApiContextEntity<ApiVersion.v1>>;
  [ApiVersion.v2]: Array<ApiContextEntity<ApiVersion.v2>>;
};

/**
 * Version-aware response type for the context query endpoint.
 *
 * @template T - API version key.
 */
export type QueryContextResponse<T> = T extends keyof typeof ApiVersion
  ? QueryContextResponseTypes[(typeof ApiVersion)[T]]
  : unknown;

/**
 * Function signature for the context query endpoint.
 *
 * @template TVersion - API version key.
 * @template TMethod - Client execution method.
 * @template TClient - HTTP client type.
 * @template TResult - Expected response type.
 */
export type QueryContextFn<
  TVersion extends string = keyof typeof ApiVersion,
  TMethod extends keyof ClientMethod<unknown> = keyof ClientMethod<unknown>,
  TClient extends IHttpClient = IHttpClient,
  TResult = QueryContextResponse<TVersion>,
> = (
  args: QueryContextArgs<TVersion>,
  init?: ClientRequestInit<TClient, TResult>,
) => QueryContextResult<TVersion, TMethod, TResult>;

/**
 * Result type for the context query endpoint.
 *
 * @template TVersion - API version key.
 * @template TMethod - Client execution method.
 * @template TResult - Expected response type.
 */
export type QueryContextResult<
  TVersion extends string = keyof typeof ApiVersion,
  TMethod extends keyof ClientMethod<unknown> = keyof ClientMethod<unknown>,
  TResult = QueryContextResponse<TVersion>,
> = ClientMethod<TResult>[TMethod];
