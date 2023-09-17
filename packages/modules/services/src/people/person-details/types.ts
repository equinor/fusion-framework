import { ApiVersion } from '../static';
import type { ApiPerson_v4, ApiPersonExpandProps_v4 } from '../api-models.v4';
import { ClientMethod } from '../../types';

export type SupportedApiVersion = Extract<keyof typeof ApiVersion, 'v4'>;

type ApiRequestArgsMap = {
    [ApiVersion.v4]: {
        azureId: string;
        expand?: Array<ApiPersonExpandProps_v4>;
    };
};

export type AllowedArgs = ApiRequestArgsMap[keyof ApiRequestArgsMap];

export type ApiRequestArgs<T extends SupportedApiVersion> =
    ApiRequestArgsMap[(typeof ApiVersion)[T]];

type ApiResponseTypes<TArgs extends AllowedArgs> = {
    [ApiVersion.v4]: ApiPerson_v4<TArgs['expand'] extends [] ? TArgs['expand'] : []>;
};

export type ApiResponse<
    T extends SupportedApiVersion,
    TArgs extends AllowedArgs,
> = ApiResponseTypes<TArgs>[(typeof ApiVersion)[T]];

export type ApiResult<
    TVersion extends SupportedApiVersion,
    TArgs extends ApiRequestArgs<TVersion>,
    TMethod extends keyof ClientMethod<unknown> = keyof ClientMethod<unknown>,
    TResult = ApiResponse<TVersion, TArgs>,
> = ClientMethod<TResult>[TMethod];
