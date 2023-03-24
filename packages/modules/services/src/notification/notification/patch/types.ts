import { IHttpClient, ClientRequestInit } from '@equinor/fusion-framework-module-http/client';
import { ClientMethod } from '../../../types';
import { ApiNotificationEntity } from '../../api-models';
import { ApiVersion } from '../../static';

type PatchNotificationArgs_v1 = {
    id: string;
    seenByUser: boolean;
};

type PatchNotificationArgs_v2 = PatchNotificationArgs_v1;

type PatchNotificationArgsTypes = {
    [ApiVersion.v1]: PatchNotificationArgs_v1;
    [ApiVersion.v2]: PatchNotificationArgs_v2;
};

export type PatchNotificationArgs<T extends string> = T extends keyof typeof ApiVersion
    ? PatchNotificationArgsTypes[(typeof ApiVersion)[T]]
    : unknown;

type PatchNotificationResponseTypes = {
    [ApiVersion.v1]: ApiNotificationEntity<ApiVersion.v1>;
    [ApiVersion.v2]: ApiNotificationEntity<ApiVersion.v2>;
};

export type PatchNotificationResponse<T> = T extends keyof typeof ApiVersion
    ? PatchNotificationResponseTypes[(typeof ApiVersion)[T]]
    : unknown;

export type PatchNotificationFn<
    TVersion extends string = keyof typeof ApiVersion,
    TMethod extends keyof ClientMethod<unknown> = keyof ClientMethod<unknown>,
    TClient extends IHttpClient = IHttpClient,
    TResult = PatchNotificationResponse<TVersion>
> = (
    args: PatchNotificationArgs<TVersion>,
    init?: ClientRequestInit<TClient, TResult>
) => PatchNotificationResult<TVersion, TMethod, TResult>;

export type PatchNotificationResult<
    TVersion extends string = keyof typeof ApiVersion,
    TMethod extends keyof ClientMethod<unknown> = keyof ClientMethod<unknown>,
    TResult = PatchNotificationResponse<TVersion>
> = ClientMethod<TResult>[TMethod];
