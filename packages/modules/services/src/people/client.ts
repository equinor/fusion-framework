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

export class PeopleApiClient<
  // TMethod extends keyof ClientMethod<unknown> = keyof ClientMethod<unknown>,
  TClient extends IHttpClient = IHttpClient,
> {
  get Version(): typeof ApiVersion {
    return ApiVersion;
  }

  constructor(protected _client: TClient) { }

  /**
   * Fetch person by id
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
   * Query person service
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
   * Photo person service
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
  * Suggest person service
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
  * Resolve person service
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
