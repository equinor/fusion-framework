import type { IHttpClient, ClientRequestInit } from '@equinor/fusion-framework-module-http/client';

import { ApiVersion, type ApiContextEntity, type ClientMethod } from '..';

export { ApiClientArguments, ClientMethod } from '..';

/**
 * Extended context entity that includes relationship metadata.
 *
 * @template T - An {@link ApiVersion} member.
 */
export type ApiRelatedContextEntity<T extends ApiVersion> = ApiContextEntity<T> & {
  relationSource: string; // "ProjectMaster|OrgChart",
  relationType: unknown;
};

/**
 * OData filter for narrowing related-context results by type.
 */
export type RelatedContextOdataFilter = {
  type?: string[];
};

/**
 * Structured OData query parameters for related-context lookups.
 */
export type RelatedContextOdataParameters = {
  search?: string;
  filter?: RelatedContextOdataFilter;
};

type RelatedContextArgs_v1 = {
  /** context id */
  id: string;
  query?: string | RelatedContextOdataParameters;
};

type RelatedContextArgs_v2 = RelatedContextArgs_v1;

type RelatedContextArgTypes = {
  [ApiVersion.v1]: RelatedContextArgs_v1;
  [ApiVersion.v2]: RelatedContextArgs_v2;
};

/**
 * Version-aware argument type for the related-contexts endpoint.
 *
 * @template T - API version key.
 */
export type RelatedContextArgs<T> = T extends keyof typeof ApiVersion
  ? RelatedContextArgTypes[(typeof ApiVersion)[T]]
  : { id: string };

type RelatedContextResponseTypes = {
  [ApiVersion.v1]: Array<ApiRelatedContextEntity<ApiVersion.v1>>;
  [ApiVersion.v2]: Array<ApiRelatedContextEntity<ApiVersion.v2>>;
};

/**
 * Version-aware response type for the related-contexts endpoint.
 *
 * @template T - API version key.
 */
export type RelatedContextResponse<T> = T extends keyof typeof ApiVersion
  ? RelatedContextResponseTypes[(typeof ApiVersion)[T]]
  : unknown;

/**
 * Function signature for the related-contexts endpoint.
 *
 * @template TVersion - API version key.
 * @template TMethod - Client execution method.
 * @template TClient - HTTP client type.
 * @template TResult - Expected response type.
 */
export type RelatedContextFn<
  TVersion extends string = keyof typeof ApiVersion,
  TMethod extends keyof ClientMethod<unknown> = keyof ClientMethod<unknown>,
  TClient extends IHttpClient = IHttpClient,
  TResult = RelatedContextResponse<TVersion>,
> = (
  args: RelatedContextArgs<TVersion>,
  init?: ClientRequestInit<TClient, TResult>,
) => RelatedContextResult<TVersion, TMethod, TResult>;

/**
 * Result type for the related-contexts endpoint.
 *
 * @template TVersion - API version key.
 * @template TMethod - Client execution method.
 * @template TResult - Expected response type.
 */
export type RelatedContextResult<
  TVersion extends string = keyof typeof ApiVersion,
  TMethod extends keyof ClientMethod<unknown> = keyof ClientMethod<unknown>,
  TResult = RelatedContextResponse<TVersion>,
> = ClientMethod<TResult>[TMethod];
