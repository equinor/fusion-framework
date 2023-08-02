import {
    ClientRequestInit,
    IHttpClient,
    FetchResponse,
    StreamResponse,
} from '@equinor/fusion-framework-module-http/client';

export type ApiClientFactory<TClient extends IHttpClient = IHttpClient> = (
    name: string,
) => Promise<TClient>;

export type ApiClientArguments<TClient extends IHttpClient, TResult = unknown> = [
    path: string,
    init?: ClientRequestInit<TClient, TResult>,
];

/**
 * Execute methods on the IHttpClient
 */
export type ClientMethod<T = unknown> = {
    /**
     * Fetch data async
     * NOTE: data needs to be extracted from the response
     */
    fetch: Promise<FetchResponse<T>>;
    /**
     * Fetch JSON data from a service
     */
    json: Promise<T>;
    /**
     * Fetch data as an observable
     * NOTE: data needs to be extracted from the response
     */
    fetch$: StreamResponse<FetchResponse<T>>;
    /**
     * Fetch JSON data from a service as observable
     */
    json$: StreamResponse<T>;
};

export type ClientMethodType = keyof ClientMethod;
