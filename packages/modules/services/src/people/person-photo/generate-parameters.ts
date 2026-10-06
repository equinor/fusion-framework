import type { ClientRequestInit, IHttpClient } from '@equinor/fusion-framework-module-http/client';

import { generateEndpoint } from './generate-endpoint.js';

import type { ApiClientArguments } from '../../types.js';
import type { ApiRequestArgs, SupportedApiVersion } from './types.js';

/** function for creating http client arguments  */
export const generateParameters = <
  TResult,
  TVersion extends SupportedApiVersion,
  TClient extends IHttpClient = IHttpClient,
>(
  version: TVersion,
  args: ApiRequestArgs<TVersion>,
  init?: ClientRequestInit<TClient, TResult>,
): ApiClientArguments<TClient, TResult> => {
  const path = generateEndpoint(version, args);
  return [path, init];
};

export default generateParameters;
