import { IHttpClient, ClientRequestInit } from '@equinor/fusion-framework-module-http/client';
import { ClientMethod } from '../../../types';
import { ApiNotificationEntity } from '../../api-models';
import { ApiVersion } from '../../static';

type DeleteNotificationArgs_v1 = {
    id: string;
};

type DeleteNotificationArgs_v2 = DeleteNotificationArgs_v1;

type DeleteNotificationArgsTypes = {
    [ApiVersion.v1]: DeleteNotificationArgs_v1;
    [ApiVersion.v2]: DeleteNotificationArgs_v2;
};

export type DeleteNotificationArgs<T extends string> = T extends keyof typeof ApiVersion
    ? DeleteNotificationArgsTypes[(typeof ApiVersion)[T]]
    : unknown;

type DeleteNotificationResponseTypes = {
    [ApiVersion.v1]: ApiNotificationEntity<ApiVersion.v1>;
    [ApiVersion.v2]: ApiNotificationEntity<ApiVersion.v2>;
};

export type DeleteNotificationResponse<T> = T extends keyof typeof ApiVersion
    ? DeleteNotificationResponseTypes[(typeof ApiVersion)[T]]
    : unknown;

export type DeleteNotificationFn<
    TVersion extends string = keyof typeof ApiVersion,
    TMethod extends keyof ClientMethod<unknown> = keyof ClientMethod<unknown>,
    TClient extends IHttpClient = IHttpClient,
    TResult = DeleteNotificationResponse<TVersion>
> = (
    args: DeleteNotificationArgs<TVersion>,
    init?: ClientRequestInit<TClient, TResult>
) => DeleteNotificationResult<TVersion, TMethod, TResult>;

export type DeleteNotificationResult<
    TVersion extends string = keyof typeof ApiVersion,
    TMethod extends keyof ClientMethod<unknown> = keyof ClientMethod<unknown>,
    TResult = DeleteNotificationResponse<TVersion>
> = ClientMethod<TResult>[TMethod];
