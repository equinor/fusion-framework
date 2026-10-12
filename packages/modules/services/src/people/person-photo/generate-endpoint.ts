import { UnsupportedApiVersion } from '../../UnsupportedApiVersion.js';
import { ApiVersion } from '../static.js';

import type { ApiRequestArgs, SupportedApiVersion } from './types.js';

/**
 * Method for generating endpoint for getting context by id
 */
export const generateEndpoint = <TVersion extends SupportedApiVersion>(
  version: TVersion,
  args: ApiRequestArgs<TVersion>,
) => {
  const apiVersion = ApiVersion[version as keyof typeof ApiVersion] ?? version;
  // Select the endpoint format supported by the requested people API version.
  switch (apiVersion) {
    case ApiVersion.v2: {
      const { azureId } = args;
      const params = new URLSearchParams();
      params.append('api-version', apiVersion);
      return `/persons/${azureId}/photo?${String(params)}`;
    }
    default: {
      throw new UnsupportedApiVersion(version);
    }
  }
};
