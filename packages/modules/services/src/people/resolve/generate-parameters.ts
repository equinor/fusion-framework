import type { ClientRequestInit, IHttpClient } from '@equinor/fusion-framework-module-http/client';

import { generateEndpoint } from './generate-endpoint';

import type { ApiClientArguments } from '../../types';

/** function for creating http client arguments  */
export const generateParameters = <
  TResult,
  TClient extends IHttpClient = IHttpClient,
>(
  init?: ClientRequestInit<TClient, TResult>,
): ApiClientArguments<TClient, TResult> => {
  const path = generateEndpoint();
  return [path, init];
};

export default generateParameters;
