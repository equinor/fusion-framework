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

export type QueryContextOdataFilter = {
    type?: string[];
    externalId?: string;
};

export type QueryContextOdataParameters = {
    search?: string;
    filter?: QueryContextOdataFilter;
};

type QueryContextArgs_v1 = {
    query: string | QueryContextOdataParameters;
    includeDeleted?: boolean;
};

type QueryContextArgs_v2 = QueryContextArgs_v1;

type SearchContextArgTypes = {
    [ApiVersion.v1]: QueryContextArgs_v1;
    [ApiVersion.v2]: QueryContextArgs_v2;
};

export type QueryContextArgs<T> = T extends keyof typeof ApiVersion
    ? SearchContextArgTypes[(typeof ApiVersion)[T]]
    : { query: { search: string } };

type QueryContextResponseTypes = {
    [ApiVersion.v1]: Array<ApiContextEntity<ApiVersion.v1>>;
    [ApiVersion.v2]: Array<ApiContextEntity<ApiVersion.v2>>;
};

export type QueryContextResponse<T> = T extends keyof typeof ApiVersion
    ? QueryContextResponseTypes[(typeof ApiVersion)[T]]
    : unknown;

export type QueryContextFn<
    TVersion extends string = keyof typeof ApiVersion,
    TMethod extends keyof ClientMethod<unknown> = keyof ClientMethod<unknown>,
    TClient extends IHttpClient = IHttpClient,
    TResult = QueryContextResponse<TVersion>
> = (
    args: QueryContextArgs<TVersion>,
    init?: ClientRequestInit<TClient, TResult>
) => QueryContextResult<TVersion, TMethod, TResult>;

export type QueryContextResult<
    TVersion extends string = keyof typeof ApiVersion,
    TMethod extends keyof ClientMethod<unknown> = keyof ClientMethod<unknown>,
    TResult = QueryContextResponse<TVersion>
> = ClientMethod<TResult>[TMethod];
