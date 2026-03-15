import { ApiVersion } from '../static';
import type { ApiPerson_v4, ApiPersonExpandProps_v4 } from '../api-models.v4';
import type { ClientMethod } from '../../types';

/** API versions that support the person-details endpoint. */
export type SupportedApiVersion = Extract<keyof typeof ApiVersion, 'v4'>;

type ApiRequestArgsMap = {
  [ApiVersion.v4]: {
    azureId: string;
    expand?: Array<ApiPersonExpandProps_v4>;
  };
};

/** Union of all valid request argument shapes across supported versions. */
export type AllowedArgs = ApiRequestArgsMap[keyof ApiRequestArgsMap];

/**
 * Version-aware request argument type for the person-details endpoint.
 *
 * @template T - Supported API version key.
 */
export type ApiRequestArgs<T extends SupportedApiVersion> =
  ApiRequestArgsMap[(typeof ApiVersion)[T]];

type ApiResponseTypes<TArgs extends AllowedArgs> = {
  [ApiVersion.v4]: ApiPerson_v4<TArgs['expand'] extends [] ? TArgs['expand'] : []>;
};

/**
 * Version-aware response type for the person-details endpoint.
 *
 * @template T - Supported API version key.
 * @template TArgs - Request argument type.
 */
export type ApiResponse<
  T extends SupportedApiVersion,
  TArgs extends AllowedArgs,
> = ApiResponseTypes<TArgs>[(typeof ApiVersion)[T]];

/**
 * Result type for the person-details endpoint.
 *
 * @template TVersion - Supported API version key.
 * @template TArgs - Request argument type.
 * @template TMethod - Client execution method.
 * @template TResult - Expected response type.
 */
export type ApiResult<
  TVersion extends SupportedApiVersion,
  TArgs extends ApiRequestArgs<TVersion>,
  TMethod extends keyof ClientMethod<unknown> = keyof ClientMethod<unknown>,
  TResult = ApiResponse<TVersion, TArgs>,
> = ClientMethod<TResult>[TMethod];
