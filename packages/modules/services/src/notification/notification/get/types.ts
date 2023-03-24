import { IHttpClient, ClientRequestInit } from '@equinor/fusion-framework-module-http/client';
import { ClientMethod } from '../../../types';
import { ApiNotificationEntity } from '../../api-models';
import { ApiVersion } from '../../static';

type GetNotificationArgs_v1 = {
    id: string;
};

type GetNotificationArgs_v2 = GetNotificationArgs_v1;

type GetNotificationArgsTypes = {
    [ApiVersion.v1]: GetNotificationArgs_v1;
    [ApiVersion.v2]: GetNotificationArgs_v2;
};

export type GetNotificationArgs<T extends string> = T extends keyof typeof ApiVersion
    ? GetNotificationArgsTypes[(typeof ApiVersion)[T]]
    : unknown;

type GetNotificationResponseTypes = {
    [ApiVersion.v1]: ApiNotificationEntity<ApiVersion.v1>;
    [ApiVersion.v2]: ApiNotificationEntity<ApiVersion.v2>;
};

export type GetNotificationResponse<T> = T extends keyof typeof ApiVersion
    ? GetNotificationResponseTypes[(typeof ApiVersion)[T]]
    : unknown;

export type GetNotificationFn<
    TVersion extends string = keyof typeof ApiVersion,
    TMethod extends keyof ClientMethod<unknown> = keyof ClientMethod<unknown>,
    TClient extends IHttpClient = IHttpClient,
    TResult = GetNotificationResponse<TVersion>
> = (
    args: GetNotificationArgs<TVersion>,
    init?: ClientRequestInit<TClient, TResult>
) => GetNotificationResult<TVersion, TMethod, TResult>;

export type GetNotificationResult<
    TVersion extends string = keyof typeof ApiVersion,
    TMethod extends keyof ClientMethod<unknown> = keyof ClientMethod<unknown>,
    TResult = GetNotificationResponse<TVersion>
> = ClientMethod<TResult>[TMethod];
