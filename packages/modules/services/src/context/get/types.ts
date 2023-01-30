import { IHttpClient, ClientRequestInit } from '@equinor/fusion-framework-module-http/client';

import {
    ApiVersion,
    ApiContextEntity,
    ClientMethod,
} from '@equinor/fusion-framework-module-services/context';

export {
    ApiClientArguments,
    ClientMethod,
} from '@equinor/fusion-framework-module-services/context';

type GetContextArgs_v1 = {
    id: string;
};

type GetContextArgs_v2 = GetContextArgs_v1;

type GetContextArgsTypes = {
    [ApiVersion.v1]: GetContextArgs_v1;
    [ApiVersion.v2]: GetContextArgs_v2;
};

export type GetContextArgs<T extends string> = T extends keyof typeof ApiVersion
    ? GetContextArgsTypes[(typeof ApiVersion)[T]]
    : unknown;

type GetContextResponseTypes = {
    [ApiVersion.v1]: ApiContextEntity<ApiVersion.v1>;
    [ApiVersion.v2]: ApiContextEntity<ApiVersion.v2>;
};

export type GetContextResponse<T> = T extends keyof typeof ApiVersion
    ? GetContextResponseTypes[(typeof ApiVersion)[T]]
    : unknown;

export type GetContextFn<
    TVersion extends string = keyof typeof ApiVersion,
    TMethod extends keyof ClientMethod<unknown> = keyof ClientMethod<unknown>,
    TClient extends IHttpClient = IHttpClient,
    TResult = GetContextResponse<TVersion>
> = (
    args: GetContextArgs<TVersion>,
    init?: ClientRequestInit<TClient, TResult>
) => GetContextResult<TVersion, TMethod, TResult>;

export type GetContextResult<
    TVersion extends string = keyof typeof ApiVersion,
    TMethod extends keyof ClientMethod<unknown> = keyof ClientMethod<unknown>,
    TResult = GetContextResponse<TVersion>
> = ClientMethod<TResult>[TMethod];
