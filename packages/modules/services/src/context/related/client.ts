import { ClientRequestInit, IHttpClient } from '@equinor/fusion-framework-module-http/client';

import { ApiVersion } from '..';

import { generateParameters } from './generate-parameters';

import type {
    RelatedContextArgs,
    RelatedContextResponse,
    RelatedContextResult,
    ClientMethod,
} from './types';

/**
 * Function for querying the context service
 */
export const relatedContexts =
    <
        TVersion extends string = keyof typeof ApiVersion,
        TMethod extends keyof ClientMethod = keyof ClientMethod,
        TClient extends IHttpClient = IHttpClient,
    >(
        client: TClient,
        version: TVersion,
        method: TMethod = 'json' as TMethod,
    ) =>
    <T = RelatedContextResponse<TVersion>>(
        args: RelatedContextArgs<TVersion>,
        init?: ClientRequestInit<TClient, T>,
    ): RelatedContextResult<TVersion, TMethod, T> =>
        client[method](
            ...generateParameters<T, TVersion, TClient>(version, args, init),
        ) as RelatedContextResult<TVersion, TMethod, T>;

export default relatedContexts;
