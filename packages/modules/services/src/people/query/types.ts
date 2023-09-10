import { ApiVersion } from '../static';
import { ApiPerson_v2 } from '../api-models.v2';
import { ClientMethod } from '../../types';

export type SupportedApiVersion = Extract<keyof typeof ApiVersion, 'v2'>;

type ApiRequestArgsMap = {
    [ApiVersion.v2]: {
        search: string;
    };
};

export type AllowedArgs = ApiRequestArgsMap[keyof ApiRequestArgsMap];

export type ApiRequestArgs<T extends SupportedApiVersion> =
    ApiRequestArgsMap[(typeof ApiVersion)[T]];

type ApiResponseTypes = {
    [ApiVersion.v2]: Array<ApiPerson_v2>;
};

export type ApiResponse<T extends SupportedApiVersion> = ApiResponseTypes[(typeof ApiVersion)[T]];

export type ApiResult<
    TVersion extends SupportedApiVersion,
    TMethod extends keyof ClientMethod<unknown> = keyof ClientMethod<unknown>,
    TResult = ApiResponse<TVersion>,
> = ClientMethod<TResult>[TMethod];
