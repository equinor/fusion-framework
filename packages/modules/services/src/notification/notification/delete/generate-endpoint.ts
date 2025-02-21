import { UnsupportedApiVersion } from '../../../errors';
import { ApiVersion } from '../..';
import type { DeleteNotificationArgs } from './types';

/**
 * Method for generating endpoint for getting notification by id
 */
export const generateEndpoint = <TVersion extends string = keyof typeof ApiVersion>(
  version: TVersion,
  args: DeleteNotificationArgs<TVersion>,
): string => {
  const apiVersion = ApiVersion[version as keyof typeof ApiVersion] ?? version;
  switch (apiVersion) {
    case ApiVersion.v2:
      throw new UnsupportedApiVersion(version);
    default: {
      const { id } = args as { id: string };
      const params = new URLSearchParams();
      params.append('api-version', apiVersion);
      return `/notification/${id}/?${String(params)}`;
    }
  }
};
