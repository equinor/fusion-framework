import { ClientRequestInit, IHttpClient } from '@equinor/fusion-framework-module-http/client';
import { ApiClientArguments } from '../..';
import { generateEndpoint } from './generate-endpoint';
import { ApiVersions, HeadBookmarkFavoriteArgs } from './types';

/** function for creating http client arguments  */
export const generateParameters = <
    TResult,
    TVersion extends ApiVersions,
    TClient extends IHttpClient = IHttpClient
>(
    version: TVersion,
    args: HeadBookmarkFavoriteArgs<TVersion>,
    init?: ClientRequestInit<TClient, TResult>
): ApiClientArguments<TClient, TResult> => {
    const path = generateEndpoint(version, args);

    const headers = new Headers();
    headers.append('content-type', 'application/json');

    const requestParams: ClientRequestInit<TClient, TResult> = Object.assign(
        {},
        { method: 'head', headers: headers },
        init
    );

    return [path, requestParams];
};
