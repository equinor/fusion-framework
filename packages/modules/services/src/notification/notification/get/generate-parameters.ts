import type { ClientRequestInit, IHttpClient } from '@equinor/fusion-framework-module-http/client';
import type { ApiVersion } from '../../static';
import type { ApiClientArguments } from '../../types';

import { generateEndpoint } from './generate-endpoint';
import type { GetNotificationArgs } from './types';

/** function for creating http client arguments  */
export const generateParameters = <
  TResult,
  TVersion extends string = keyof typeof ApiVersion,
  TClient extends IHttpClient = IHttpClient,
>(
  version: TVersion,
  args: GetNotificationArgs<TVersion>,
  init?: ClientRequestInit<TClient, TResult>,
): ApiClientArguments<TClient, TResult> => {
  const path = generateEndpoint(version, args);
  return [path, init];
};

export default generateParameters;
