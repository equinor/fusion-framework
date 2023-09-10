import { ApiVersion } from '../static';
import type { ApiManager } from '../api-models';
import type {
    ApiCompanyInfo_v4,
    ApiPersonContract_v4,
    ApiPerson_v4,
    ApiPersonPosition_v4,
    ApiPersonRole_v4,
} from '../api-models.v4';
import { ClientMethod } from '../../types';

export type SupportedApiVersion = Extract<keyof typeof ApiVersion, 'v4'>;

type ApiRequestArgsMap = {
    [ApiVersion.v4]: {
        azureId: string;
        expand?: Array<keyof ExpandMap[ApiVersion.v4]>;
    };
};

export type AllowedArgs = ApiRequestArgsMap[keyof ApiRequestArgsMap];

type ExpandMap = {
    [ApiVersion.v4]: {
        roles: Array<ApiPersonRole_v4>;
        positions: Array<ApiPersonPosition_v4>;
        contracts: Array<ApiPersonContract_v4>;
        manager: ApiManager;
        companies: Array<ApiCompanyInfo_v4>;
    };
};

export type ApiRequestArgs<T extends SupportedApiVersion> =
    ApiRequestArgsMap[(typeof ApiVersion)[T]];

type ApiResponseTypes<TArgs extends AllowedArgs> = {
    [ApiVersion.v4]: TArgs['expand'] extends Array<keyof ExpandMap[ApiVersion.v4]>
        ? ApiPerson_v4 & {
              [K in TArgs['expand'][number]]: ExpandMap[ApiVersion.v4][K];
          }
        : ApiPerson_v4;
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
