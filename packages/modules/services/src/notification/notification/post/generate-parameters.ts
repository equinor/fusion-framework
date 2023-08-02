import type { ClientRequestInit, IHttpClient } from '@equinor/fusion-framework-module-http/client';
import { ApiVersion } from '../../static';
import { ApiClientArguments } from '../../types';

import { generateEndpoint } from './generate-endpoint';
import { PostNotificationArgs } from './types';

/** function for creating http client arguments  */
export const generateParameters = <
    TResult,
    TVersion extends string = keyof typeof ApiVersion,
    TClient extends IHttpClient = IHttpClient,
>(
    version: TVersion,
    args: PostNotificationArgs<TVersion>,
    init?: ClientRequestInit<TClient, TResult>,
): ApiClientArguments<TClient, TResult> => {
    const path = generateEndpoint(version, args);

    const headers = new Headers();
    headers.append('content-type', 'application/json');

    const requestParams: ClientRequestInit<TClient, TResult> = Object.assign(
        {},
        { method: 'post', body: JSON.stringify(args), headers: headers },
        init,
    );

    return [path, requestParams];
};

export default generateParameters;
