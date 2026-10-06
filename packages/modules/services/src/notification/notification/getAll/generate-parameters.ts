import type { ClientRequestInit, IHttpClient } from '@equinor/fusion-framework-module-http/client';
import type { ApiVersion } from '../../static.js';
import type { ApiClientArguments } from '../../types.js';

import { generateEndpoint } from './generate-endpoint.js';
import type { GetNotificationsArgs } from './types.js';

/** function for creating http client arguments  */
export const generateParameters = <
  TResult,
  TVersion extends string = keyof typeof ApiVersion,
  TClient extends IHttpClient = IHttpClient,
>(
  version: TVersion,
  args: GetNotificationsArgs<TVersion>,
  init?: ClientRequestInit<TClient, TResult>,
): ApiClientArguments<TClient, TResult> => {
  const path = generateEndpoint(version, args);
  return [path, init];
};

export default generateParameters;
