import { ApiVersion } from '../static';
import type { ApiPerson_v2 } from '../api-models.v2';
import type { ClientMethod } from '../../types';

/** API versions that support the people query endpoint. */
export type SupportedApiVersion = Extract<keyof typeof ApiVersion, 'v2'>;

type ApiRequestArgsMap = {
  [ApiVersion.v2]: {
    search: string;
  };
};

/** Union of all valid request argument shapes across supported versions. */
export type AllowedArgs = ApiRequestArgsMap[keyof ApiRequestArgsMap];

/**
 * Version-aware request argument type for the people query endpoint.
 *
 * @template T - Supported API version key.
 */
export type ApiRequestArgs<T extends SupportedApiVersion> =
  ApiRequestArgsMap[(typeof ApiVersion)[T]];

type ApiResponseTypes = {
  [ApiVersion.v2]: Array<ApiPerson_v2>;
};

/**
 * Version-aware response type for the people query endpoint.
 *
 * @template T - Supported API version key.
 */
export type ApiResponse<T extends SupportedApiVersion> = ApiResponseTypes[(typeof ApiVersion)[T]];

/**
 * Result type for the people query endpoint.
 *
 * @template TVersion - Supported API version key.
 * @template TMethod - Client execution method.
 * @template TResult - Expected response type.
 */
export type ApiResult<
  TVersion extends SupportedApiVersion,
  TMethod extends keyof ClientMethod<unknown> = keyof ClientMethod<unknown>,
  TResult = ApiResponse<TVersion>,
> = ClientMethod<TResult>[TMethod];
