import {
    ClientRequestInit,
    IHttpClient,
    StreamResponse,
} from '@equinor/fusion-framework-module-http/client';

export type ApiClientArguments<TClient extends IHttpClient, TResult = unknown> = [
    path: string,
    init?: ClientRequestInit<TClient, TResult>
];

export type RequestInitCallback<TResult, TClient extends IHttpClient = IHttpClient> = (
    path: string,
    init?: ClientRequestInit<TClient, TResult>
) => ApiClientArguments<TClient, TResult> | void;

export type ClientMethod<T = unknown> = {
    fetch: Promise<T>;
    json: Promise<T>;
    fetch$: StreamResponse<T>;
    json$: StreamResponse<T>;
};
