import type { ClientRequestInit, IHttpClient } from '@equinor/fusion-framework-module-http/client';

import type { ApiVersion } from '../index.js';

import { generateEndpoint } from './generate-endpoint.js';

import type { RelatedContextArgs, ApiClientArguments } from './types.js';

/** Function for generating parameter for querying context service  */
export const generateParameters = <
  TResult,
  TVersion extends string = keyof typeof ApiVersion,
  TClient extends IHttpClient = IHttpClient,
>(
  version: TVersion,
  args: RelatedContextArgs<TVersion>,
  init?: ClientRequestInit<TClient, TResult>,
): ApiClientArguments<TClient, TResult> => {
  const path = generateEndpoint(version, args);
  return [path, init];
};

export default generateParameters;
