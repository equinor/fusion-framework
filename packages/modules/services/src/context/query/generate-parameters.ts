import { ClientRequestInit, IHttpClient } from '@equinor/fusion-framework-module-http/client';

import { ApiVersion } from '..';

import { generateEndpoint } from './generate-endpoint';

import type { QueryContextArgs, ApiClientArguments } from './types';

/** Function for generating parameter for querying context service  */
export const generateParameters = <
    TResult,
    TVersion extends string = keyof typeof ApiVersion,
    TClient extends IHttpClient = IHttpClient,
>(
    version: TVersion,
    args: QueryContextArgs<TVersion>,
    init?: ClientRequestInit<TClient, TResult>,
): ApiClientArguments<TClient, TResult> => {
    const path = generateEndpoint(version, args);
    return [path, init];
};

export default generateParameters;
