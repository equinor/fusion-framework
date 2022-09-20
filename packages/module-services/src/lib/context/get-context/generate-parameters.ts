import { IHttpClient } from '@equinor/fusion-framework-module-http';

import { ApiVersion } from '../static';

import { generateEndpoint } from './generate-endpoint';

import type { RequestInitCallback, ApiClientArguments } from '../../types';
import type { GetContextArgs } from './types';

export const generateParameters = <
    TResult,
    TVersion extends ApiVersion,
    TClient extends IHttpClient = IHttpClient
>(
    version: TVersion,
    args: GetContextArgs<TVersion>,
    cb?: RequestInitCallback<TResult, TClient>
): ApiClientArguments<TClient, TResult> => {
    const path = generateEndpoint(version, args);
    return (cb && cb(path)) ?? [path];
};

export default generateParameters;
