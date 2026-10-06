import type { ClientRequestInit, IHttpClient } from '@equinor/fusion-framework-module-http/client';
import type { ApiVersion } from '../../static.js';
import type { ApiClientArguments } from '../../types.js';

import { generateEndpoint } from './generate-endpoint.js';
import type { DeleteNotificationArgs } from './types.js';

/** function for creating http client arguments  */
export const generateParameters = <
  TResult,
  TVersion extends string = keyof typeof ApiVersion,
  TClient extends IHttpClient = IHttpClient,
>(
  version: TVersion,
  args: DeleteNotificationArgs<TVersion>,
  init?: ClientRequestInit<TClient, TResult>,
): ApiClientArguments<TClient, TResult> => {
  const path = generateEndpoint(version, args);

  const headers = new Headers();
  headers.append('content-type', 'application/json');

  // Merge the generated DELETE request defaults with caller overrides.
  const requestParams: ClientRequestInit<TClient, TResult> = Object.assign(
    {},
    { method: 'DELETE', headers: headers },
    init,
  );

  return [path, requestParams];
};

export default generateParameters;
