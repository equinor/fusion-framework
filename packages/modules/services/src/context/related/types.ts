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

export type ApiRelatedContextEntity<T extends ApiVersion> = ApiContextEntity<T> & {
    relationSource: string; // "ProjectMaster|OrgChart",
    relationType: unknown;
};

export type RelatedContextOdataFilter = {
    type?: string[];
};

export type RelatedContextOdataParameters = {
    search?: string;
    filter?: RelatedContextOdataFilter;
};

type RelatedContextArgs_v1 = {
    /** context id */
    id: string;
    query?: string | RelatedContextOdataParameters;
};

type RelatedContextArgs_v2 = RelatedContextArgs_v1;

type RelatedContextArgTypes = {
    [ApiVersion.v1]: RelatedContextArgs_v1;
    [ApiVersion.v2]: RelatedContextArgs_v2;
};

export type RelatedContextArgs<T> = T extends keyof typeof ApiVersion
    ? RelatedContextArgTypes[(typeof ApiVersion)[T]]
    : { id: string };

type RelatedContextResponseTypes = {
    [ApiVersion.v1]: Array<ApiRelatedContextEntity<ApiVersion.v1>>;
    [ApiVersion.v2]: Array<ApiRelatedContextEntity<ApiVersion.v2>>;
};

export type RelatedContextResponse<T> = T extends keyof typeof ApiVersion
    ? RelatedContextResponseTypes[(typeof ApiVersion)[T]]
    : unknown;

export type RelatedContextFn<
    TVersion extends string = keyof typeof ApiVersion,
    TMethod extends keyof ClientMethod<unknown> = keyof ClientMethod<unknown>,
    TClient extends IHttpClient = IHttpClient,
    TResult = RelatedContextResponse<TVersion>,
> = (
    args: RelatedContextArgs<TVersion>,
    init?: ClientRequestInit<TClient, TResult>,
) => RelatedContextResult<TVersion, TMethod, TResult>;

export type RelatedContextResult<
    TVersion extends string = keyof typeof ApiVersion,
    TMethod extends keyof ClientMethod<unknown> = keyof ClientMethod<unknown>,
    TResult = RelatedContextResponse<TVersion>,
> = ClientMethod<TResult>[TMethod];
