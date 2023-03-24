import { IHttpClient, ClientRequestInit } from '@equinor/fusion-framework-module-http/client';
import { ClientMethod } from '../../../types';
import { ApiNotificationEntity } from '../../api-models';
import { ApiVersion } from '../../static';

type SourceSystem_v1 = {
    name: string;
    subSystem: string;
    identifier: string;
};

type PostNotificationArgs_v1 = {
    appKey: string;
    emailPriority: number;
    fallbackHtml: string;
    title: string;
    description: string;
    card: string;
    sourceSystem: SourceSystem_v1;
    originalCreatorUniqueId: string;
};

type PostNotificationArgs_v2 = PostNotificationArgs_v1;

type PostNotificationArgsTypes = {
    [ApiVersion.v1]: PostNotificationArgs_v1;
    [ApiVersion.v2]: PostNotificationArgs_v2;
};

export type PostNotificationArgs<T extends string> = T extends keyof typeof ApiVersion
    ? PostNotificationArgsTypes[(typeof ApiVersion)[T]]
    : unknown;

type PostNotificationResponseTypes = {
    [ApiVersion.v1]: Array<ApiNotificationEntity<ApiVersion.v1>>;
    [ApiVersion.v2]: Array<ApiNotificationEntity<ApiVersion.v2>>;
};

export type PostNotificationResponse<T> = T extends keyof typeof ApiVersion
    ? PostNotificationResponseTypes[(typeof ApiVersion)[T]]
    : unknown;

export type PostNotificationFn<
    TVersion extends string = keyof typeof ApiVersion,
    TMethod extends keyof ClientMethod<unknown> = keyof ClientMethod<unknown>,
    TClient extends IHttpClient = IHttpClient,
    TResult = PostNotificationResponse<TVersion>
> = (
    args: PostNotificationArgs<TVersion>,
    init?: ClientRequestInit<TClient, TResult>
) => PostNotificationResult<TVersion, TMethod, TResult>;

export type PostNotificationResult<
    TVersion extends string = keyof typeof ApiVersion,
    TMethod extends keyof ClientMethod<unknown> = keyof ClientMethod<unknown>,
    TResult = PostNotificationResponse<TVersion>
> = ClientMethod<TResult>[TMethod];
