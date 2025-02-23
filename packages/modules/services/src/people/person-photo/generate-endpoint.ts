import { UnsupportedApiVersion } from '../../errors';
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
