import { UnsupportedApiVersion } from '../../../UnsupportedApiVersion.js';
import { ApiVersion } from '../../index.js';

import type { PostNotificationArgs } from './types.js';

/**
 * Method for generating endpoint for getting all notifications
 */
export const generateEndpoint = <TVersion extends string = keyof typeof ApiVersion>(
  version: TVersion,
  args: PostNotificationArgs<TVersion>,
): string => {
  const apiVersion = ApiVersion[version as keyof typeof ApiVersion] ?? version;
  // Select the endpoint format supported by the requested notification API version.
  switch (apiVersion) {
    case ApiVersion.v2:
      throw new UnsupportedApiVersion(version);
    default: {
      const { userId } = args as { userId: string };
      const params = new URLSearchParams();
      params.append('api-version', apiVersion);
      return `/person/${userId}/notifications/?${String(params)}`;
    }
  }
};
