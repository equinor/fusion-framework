import { UnsupportedApiVersion } from '../../UnsupportedApiVersion';
import { ApiVersion } from '../static';

import type { ApiRequestArgs, SupportedApiVersion } from './types';

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
    case ApiVersion.v4: {
      const { azureId, expand } = args;
      const params = new URLSearchParams();
      params.append('api-version', apiVersion);
      // Include expansion only when the caller requested additional person fields.
      if (expand) {
        params.append('$expand', expand.join(','));
      }
      return `/persons/${azureId}?${String(params)}`;
    }
    default: {
      throw new UnsupportedApiVersion(version);
    }
  }
};
