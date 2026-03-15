import type { IHttpClient } from '@equinor/fusion-framework-module-http';

import type { ClientMethod } from './types';
import { ApiVersion } from './static';

import {
  getContext,
  type GetContextFn,
  type GetContextResponse,
  type GetContextResult,
} from './get';

import {
  queryContext,
  type QueryContextFn,
  type QueryContextResponse,
  type QueryContextResult,
} from './query';

import {
  type RelatedContextFn,
  type RelatedContextResponse,
  type RelatedContextResult,
  relatedContexts,
} from './related';

/**
 * Typed API client for the Fusion context service.
 *
 * Delegates to versioned endpoint implementations for fetching a single context,
 * querying contexts by search criteria, and listing related contexts.
 *
 * @template TMethod - The client execution method (`'json'` or `'json$'`).
 * @template TClient - The underlying HTTP client type.
 */
export class ContextApiClient<
  TMethod extends keyof ClientMethod<unknown> = keyof ClientMethod<unknown>,
  TClient extends IHttpClient = IHttpClient,
> {
  /** Returns the {@link ApiVersion} enum for version-constant access. */
  get Version(): typeof ApiVersion {
    return ApiVersion;
  }

  /**
   * @param _client - The HTTP client used to execute requests.
   * @param _method - The execution method (`'json'` or `'json$'`).
   */
  constructor(
    protected _client: TClient,
    protected _method: TMethod,
  ) {}

  /**
   * Fetch a single context entity by its identifier.
   *
   * @template TVersion - The API version key (e.g. `'v1'`).
   * @template TResult - The expected response type.
   * @param version - API version to use.
   * @returns The context entity matching the provided arguments.
   */
  public get<
    TVersion extends string = keyof typeof ApiVersion,
    TResult = GetContextResponse<TVersion>,
  >(
    version: TVersion,
    ...args: Parameters<GetContextFn<TVersion, TMethod, TClient, TResult>>
  ): GetContextResult<TVersion, TMethod, TResult> {
    const fn = getContext<TVersion, TMethod, TClient>(this._client, version, this._method);
    return fn<TResult>(...args);
  }

  /**
   * Query the context service with search criteria.
   *
   * @template TVersion - The API version key (e.g. `'v1'`).
   * @template TResult - The expected response type.
   * @param version - API version to use.
   * @returns An array of context entities matching the query.
   */
  public query<
    TVersion extends string = keyof typeof ApiVersion,
    TResult = QueryContextResponse<TVersion>,
  >(
    version: TVersion,
    ...args: Parameters<QueryContextFn<TVersion, TMethod, TClient, TResult>>
  ): QueryContextResult<TVersion, TMethod, TResult> {
    const fn = queryContext<TVersion, TMethod, TClient>(this._client, version, this._method);
    return fn<TResult>(...args);
  }

  /**
   * List contexts related to a specific context entity.
   *
   * @template TVersion - The API version key (e.g. `'v1'`).
   * @template TResult - The expected response type.
   * @param version - API version to use.
   * @returns An array of related context entities.
   */
  public related<
    TVersion extends string = keyof typeof ApiVersion,
    TResult = RelatedContextResponse<TVersion>,
  >(
    version: TVersion,
    ...args: Parameters<RelatedContextFn<TVersion, TMethod, TClient, TResult>>
  ): RelatedContextResult<TVersion, TMethod, TResult> {
    const fn = relatedContexts<TVersion, TMethod, TClient>(this._client, version, this._method);
    return fn<TResult>(...args);
  }
}

export default ContextApiClient;
