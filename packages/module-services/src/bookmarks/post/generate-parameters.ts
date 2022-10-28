import {
    ClientRequestInit,
    IHttpClient,
} from '@equinor/fusion-framework-module-services/../../module-http/src/lib/client';
import { ApiClientArguments } from '../..';
import { generateEndpoint } from './generate-endpoint';
import { ApiVersions, PostBookmarkArgs } from './types';

/** function for creating http client arguments  */
export const generateParameters = <
    TResult,
    TVersion extends ApiVersions,
    TClient extends IHttpClient = IHttpClient
>(
    version: TVersion,
    args: PostBookmarkArgs<TVersion>,
    init?: ClientRequestInit<TClient, TResult>
): ApiClientArguments<TClient, TResult> => {
    const path = generateEndpoint(version, args);
    //add versions switch case later

    //Not sure why this is needed, defaults to application/problem+json failing the request
    const headers = new Headers();
    headers.append('content-type', 'application/json');

    const requestParams: ClientRequestInit<TClient, TResult> = Object.assign(
        {},
        { method: 'post', body: JSON.stringify(args), headers: headers },
        init
    );

    return [path, requestParams];
};
