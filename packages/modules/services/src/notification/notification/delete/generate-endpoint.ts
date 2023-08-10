import { UnsupportedApiVersion } from '@equinor/fusion-framework-module-services/errors';
import { ApiVersion } from '@equinor/fusion-framework-module-services/notification';
import type { DeleteNotificationArgs } from './types';

/**
 * Method for generating endpoint for getting notification by id
 */
export const generateEndpoint = <TVersion extends string = keyof typeof ApiVersion>(
    version: TVersion,
    args: DeleteNotificationArgs<TVersion>,
) => {
    const apiVersion = ApiVersion[version as keyof typeof ApiVersion] ?? version;
    switch (apiVersion) {
        case ApiVersion.v2:
            throw new UnsupportedApiVersion(version);
        case ApiVersion.v1:
        default: {
            const { id } = args as { id: string };
            const params = new URLSearchParams();
            params.append('api-version', apiVersion);
            return `/notification/${id}/?${String(params)}`;
        }
    }
};
