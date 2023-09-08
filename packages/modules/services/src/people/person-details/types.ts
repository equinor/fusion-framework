import { IHttpClient, ClientRequestInit } from '@equinor/fusion-framework-module-http/client';

import { ApiVersion } from '../static';
import { ApiPersonDetailType } from '../api-models';
import { ClientMethod } from '../../types';

export type SupportedApiVersion = Extract<keyof typeof ApiVersion, 'v4'>;

type ApiRequestArgsMap = {
    [ApiVersion.v4]: {
        azureId: string;
    };
};

export type ApiRequestArgs<T extends SupportedApiVersion> = T extends SupportedApiVersion
    ? ApiRequestArgsMap[(typeof ApiVersion)[T]]
    : never;

type ApiResponseTypes = {
    [ApiVersion.v4]: ApiPersonDetailType<ApiVersion.v4>;
};

export type ApiResponse<T extends SupportedApiVersion> = T extends SupportedApiVersion
    ? ApiResponseTypes[(typeof ApiVersion)[T]]
    : never;

export type ApiRequestFn<
    TVersion extends SupportedApiVersion,
    TMethod extends keyof ClientMethod<unknown> = keyof ClientMethod<unknown>,
    TClient extends IHttpClient = IHttpClient,
    TResult = ApiResponse<TVersion>,
> = (
    args: ApiRequestArgs<TVersion>,
    init?: ClientRequestInit<TClient, TResult>,
) => ApiResult<TVersion, TMethod, TResult>;

export type ApiResult<
    TVersion extends SupportedApiVersion,
    TMethod extends keyof ClientMethod<unknown> = keyof ClientMethod<unknown>,
    TResult = ApiResponse<TVersion>,
> = ClientMethod<TResult>[TMethod];
