import {
    ClientRequestInit,
    IHttpClient,
    FetchResponse,
    StreamResponse,
} from '@equinor/fusion-framework-module-http/client';

export type ApiClientFactory<TClient extends IHttpClient = IHttpClient> = (
    name: string
) => Promise<TClient>;

export type ApiClientArguments<TClient extends IHttpClient, TResult = unknown> = [
    path: string,
    init?: ClientRequestInit<TClient, TResult>
];

export type RequestInitCallback<TResult, TClient extends IHttpClient = IHttpClient> = (
    path: string,
    init?: ClientRequestInit<TClient, TResult>
) => ApiClientArguments<TClient, TResult> | void;

export type ClientMethod<T = unknown> = {
    fetch: Promise<FetchResponse<T>>;
    json: Promise<T>;
    fetch$: StreamResponse<FetchResponse<T>>;
    json$: StreamResponse<T>;
};

export type ClientMethodType = keyof ClientMethod;
