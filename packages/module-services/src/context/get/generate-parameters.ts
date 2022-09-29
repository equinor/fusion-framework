import type { ClientRequestInit, IHttpClient } from '@equinor/fusion-framework-module-http/client';

import { ApiVersion } from '../static';

import { generateEndpoint } from './generate-endpoint';

import type { ApiClientArguments, GetContextArgs } from './types';

export const generateParameters = <
    TResult,
    TVersion extends string = keyof typeof ApiVersion,
    TClient extends IHttpClient = IHttpClient
>(
    version: TVersion,
    args: GetContextArgs<TVersion>,
    init?: ClientRequestInit<TClient, TResult>
): ApiClientArguments<TClient, TResult> => {
    const path = generateEndpoint(version, args);
    return [path, init];
};

export default generateParameters;
