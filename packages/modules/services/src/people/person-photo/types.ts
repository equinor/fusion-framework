import { IHttpClient, ClientRequestInit } from '@equinor/fusion-framework-module-http/client';

import { ApiVersion } from '../static';
import { ClientDataMethod } from '../../types';

export type SupportedApiVersion = Extract<keyof typeof ApiVersion, 'v2'>;

type ApiRequestArgsMap = {
    [ApiVersion.v2]: {
        azureId: string;
    };
};

export type ApiRequestArgs<T extends SupportedApiVersion> = T extends SupportedApiVersion
    ? ApiRequestArgsMap[(typeof ApiVersion)[T]]
    : never;

type ApiResponseTypes = {
    [ApiVersion.v2]: Blob;
};

export type ApiResponse<T extends SupportedApiVersion> = T extends SupportedApiVersion
    ? ApiResponseTypes[(typeof ApiVersion)[T]]
    : never;

export type ApiRequestFn<
    TVersion extends SupportedApiVersion,
    TMethod extends keyof ClientDataMethod = keyof ClientDataMethod,
    TClient extends IHttpClient = IHttpClient,
    TResult = ApiResponse<TVersion>,
> = (
    args: ApiRequestArgs<TVersion>,
    init?: ClientRequestInit<TClient, TResult>,
) => ClientDataMethod[TMethod];

export type ApiResult<TMethod extends keyof ClientDataMethod = keyof ClientDataMethod> =
    ClientDataMethod[TMethod];
