import { UnsupportedApiVersion } from '@equinor/fusion-framework-module-services/errors';
import { ApiVersion } from '@equinor/fusion-framework-module-services/notification';

import type { GetUserNotificationSettingsArgs } from './types';

/**
 * Method for generating endpoint for getting all notifications
 */
export const generateEndpoint = <TVersion extends string = keyof typeof ApiVersion>(
    version: TVersion,
    args: GetUserNotificationSettingsArgs<TVersion>
) => {
    const apiVersion = ApiVersion[version as keyof typeof ApiVersion] ?? version;
    switch (apiVersion) {
        case ApiVersion.v2:
            throw new UnsupportedApiVersion(version);
        case ApiVersion.v1:
        default: {
            const { userId } = args as { userId: string };
            const params = new URLSearchParams();
            params.append('api-version', apiVersion);
            return `/person/${userId}/notifications/settings/?${String(params)}`;
        }
    }
};
