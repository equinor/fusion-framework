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

export class PeopleApiClient<
  // TMethod extends keyof ClientMethod<unknown> = keyof ClientMethod<unknown>,
  TClient extends IHttpClient = IHttpClient,
> {
  get Version(): typeof ApiVersion {
    return ApiVersion;
  }

  constructor(protected _client: TClient) {}

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
}

// const oo = new PeopleApiClient(null).get('v4', 'fetch', { azureId: '123' });
// const o2 = await new PeopleApiClient(null).get('v4', 'fetch', {
//     azureId: '123',
//     expand: ['roles'],
// });
// const o3 = await new PeopleApiClient(null).get('v4', 'fetch', {
//     azureId: '123',
//     expand: ['companies', 'roles'],
// });

export default PeopleApiClient;
