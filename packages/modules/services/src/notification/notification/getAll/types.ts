import { IHttpClient, ClientRequestInit } from '@equinor/fusion-framework-module-http/client';
import { ClientMethod } from '../../../types';
import { ApiNotificationEntity } from '../../api-models';
import { ApiVersion } from '../../static';

type GetNotificationsArgs_v1 = {
    userId: string;
};

type GetNotificationsArgs_v2 = GetNotificationsArgs_v1;

type GetNotificationsArgsTypes = {
    [ApiVersion.v1]: GetNotificationsArgs_v1;
    [ApiVersion.v2]: GetNotificationsArgs_v2;
};

export type GetNotificationsArgs<T extends string> = T extends keyof typeof ApiVersion
    ? GetNotificationsArgsTypes[(typeof ApiVersion)[T]]
    : unknown;

type GetNotificationResponseTypes = {
    [ApiVersion.v1]: Array<ApiNotificationEntity<ApiVersion.v1>>;
    [ApiVersion.v2]: Array<ApiNotificationEntity<ApiVersion.v2>>;
};

export type GetNotificationsResponse<T> = T extends keyof typeof ApiVersion
    ? GetNotificationResponseTypes[(typeof ApiVersion)[T]]
    : unknown;

export type GetNotificationsFn<
    TVersion extends string = keyof typeof ApiVersion,
    TMethod extends keyof ClientMethod<unknown> = keyof ClientMethod<unknown>,
    TClient extends IHttpClient = IHttpClient,
    TResult = GetNotificationsResponse<TVersion>,
> = (
    args: GetNotificationsArgs<TVersion>,
    init?: ClientRequestInit<TClient, TResult>,
) => GetNotificationsResult<TVersion, TMethod, TResult>;

export type GetNotificationsResult<
    TVersion extends string = keyof typeof ApiVersion,
    TMethod extends keyof ClientMethod<unknown> = keyof ClientMethod<unknown>,
    TResult = GetNotificationsResponse<TVersion>,
> = ClientMethod<TResult>[TMethod];
