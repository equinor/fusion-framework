import type { IHttpClient, ClientRequestInit } from '@equinor/fusion-framework-module-http/client';

import type { ClientDataMethod, ClientMethod } from '../types';
import { ApiVersion } from './static';

import {
  client as personDetailClient,
  type ApiResponse as PersonDetailApiResponse,
  type ApiResult as PersonDetailResult,
  type SupportedApiVersion as PersonDetailSupportedApiVersion,
  type ApiRequestArgs as PersonDetailApiRequestArgs,
} from './person-details';

import {
  client as personQueryClient,
  type ApiResponse as PersonQueryApiResponse,
  type ApiResult as PersonQueryResult,
  type SupportedApiVersion as PersonQuerySupportedApiVersion,
  type ApiRequestArgs as PersonQueryApiRequestArgs,
} from './query';

import {
  client as personPhotoClient,
  type ApiResponse as PersonPhotoApiResponse,
  type ApiResult as PersonPhotoResult,
  type SupportedApiVersion as PersonPhotoSupportedApiVersion,
  type ApiRequestArgs as PersonPhotoApiRequestArgs,
} from './person-photo';

import {
  client as personSuggestClient,
  type ApiResponse as PersonSuggestApiResponse,
  type ApiResult as PersonSuggestResult,
} from './suggest';

import {
  client as personResolveClient,
  type ApiResponse as PersonResolveApiResponse,
  type ApiResult as PersonResolveResult,
} from './resolve';

/**
 * Typed API client for the Fusion people service.
 *
 * Provides methods for fetching person details, querying persons,
 * retrieving profile photos, getting suggestions, and resolving
 * person identifiers.
 *
 * @template TClient - The underlying HTTP client type.
 */
export class PeopleApiClient<
  // TMethod extends keyof ClientMethod<unknown> = keyof ClientMethod<unknown>,
  TClient extends IHttpClient = IHttpClient,
> {
  /** Returns the {@link ApiVersion} enum for version-constant access. */
  get Version(): typeof ApiVersion {
    return ApiVersion;
  }

  /** @param _client - The HTTP client used to execute people requests. */
  constructor(protected _client: TClient) {}

  /**
   * Fetch detailed information about a person by their Azure unique ID.
   *
   * @template TVersion - The API version key (e.g. `'v4'`).
   * @template TArgs - Request argument type.
   * @template TResult - Expected response type.
   * @template TMethod - Client execution method (`'json'` or `'json$'`).
   * @param version - API version to use.
   * @param method - Client execution method.
   * @param args - Request arguments including `azureId`.
   * @param init - Optional request init overrides.
   * @returns The person details.
   */
  public get<
    TVersion extends PersonDetailSupportedApiVersion,
    TArgs extends PersonDetailApiRequestArgs<TVersion>,
    TResult extends PersonDetailApiResponse<TVersion, TArgs>,
    TMethod extends keyof ClientMethod<TResult>,
  >(
    version: TVersion,
    method: TMethod,
    args: TArgs,
    init?: ClientRequestInit<TClient, TResult>,
  ): PersonDetailResult<TVersion, TArgs, TMethod, TResult> {
    const fn = personDetailClient<TVersion, TMethod, TClient, TArgs>(this._client, version, method);
    return fn(args, init);
  }

  /**
   * Search for persons matching query criteria.
   *
   * @template TVersion - The API version key (e.g. `'v2'`).
   * @template TArgs - Request argument type.
   * @template TResult - Expected response type.
   * @template TMethod - Client execution method.
   * @param version - API version to use.
   * @param method - Client execution method.
   * @param args - Request arguments including `search` string.
   * @param init - Optional request init overrides.
   * @returns An array of matching person entities.
   */
  public query<
    TVersion extends PersonQuerySupportedApiVersion,
    TArgs extends PersonQueryApiRequestArgs<TVersion>,
    TResult = PersonQueryApiResponse<TVersion>,
    TMethod extends keyof ClientMethod<TResult> = keyof ClientMethod<TResult>,
  >(
    version: TVersion,
    method: TMethod,
    args: TArgs,
    init?: ClientRequestInit<TClient, TResult>,
  ): PersonQueryResult<TVersion, TMethod, TResult> {
    const fn = personQueryClient<TVersion, TMethod, TClient>(this._client, version, method);
    return fn<TResult>(args, init);
  }

  /**
   * Fetch a person's profile photo as binary blob data.
   *
   * @template TVersion - The API version key (e.g. `'v2'`).
   * @template TArgs - Request argument type.
   * @template TResult - Expected response type.
   * @template TMethod - Client execution method (`'blob'` or `'blob$'`).
   * @param version - API version to use.
   * @param method - Client execution method.
   * @param args - Request arguments including `azureId`.
   * @param init - Optional request init overrides.
   * @returns The person's photo as a blob.
   */
  public photo<
    TVersion extends PersonPhotoSupportedApiVersion,
    TArgs extends PersonPhotoApiRequestArgs<TVersion>,
    TResult extends PersonPhotoApiResponse<TVersion> = PersonPhotoApiResponse<TVersion>,
    TMethod extends keyof ClientDataMethod = keyof ClientDataMethod,
  >(
    version: TVersion,
    method: TMethod,
    args: TArgs,
    init?: ClientRequestInit<TClient, TResult>,
  ): PersonPhotoResult<TMethod> {
    const fn = personPhotoClient<TVersion, TMethod, TClient>(this._client, version, method);
    return fn<TResult>(args, init);
  }

  /**
   * Fetch person suggestions (type-ahead / autocomplete).
   *
   * @template TResult - Expected response type.
   * @template TMethod - Client execution method.
   * @param method - Client execution method.
   * @param init - Optional request init overrides.
   * @returns Paginated suggestion results.
   */
  public suggest<
    TResult = PersonSuggestApiResponse,
    TMethod extends keyof ClientMethod<TResult> = keyof ClientMethod<TResult>,
  >(
    method: TMethod,
    init?: ClientRequestInit<TClient, TResult>,
  ): PersonSuggestResult<TMethod, TResult> {
    const fn = personSuggestClient<TMethod, TClient>(this._client, method);
    return fn<TResult>(init);
  }

  /**
   * Resolve person identifiers to account information.
   *
   * @template TResult - Expected response type.
   * @template TMethod - Client execution method.
   * @param method - Client execution method.
   * @param init - Optional request init overrides.
   * @returns Array of resolved person results.
   */
  public resolve<
    TResult = PersonResolveApiResponse,
    TMethod extends keyof ClientMethod<TResult> = keyof ClientMethod<TResult>,
  >(
    method: TMethod,
    init?: ClientRequestInit<TClient, TResult>,
  ): PersonResolveResult<TMethod, TResult> {
    const fn = personResolveClient<TMethod, TClient>(this._client, method);
    return fn<TResult>(init);
  }
}

export default PeopleApiClient;
