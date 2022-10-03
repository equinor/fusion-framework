import { UnsupportedApiVersion } from '@equinor/fusion-framework-module-services/errors';
import { ApiVersion } from '@equinor/fusion-framework-module-services/context';

import type { GetContextArgs } from './types';

/**
 * Method for generating endpoint for getting context by id
 */
export const generateEndpoint = <TVersion extends string = keyof typeof ApiVersion>(
    version: TVersion,
    args: GetContextArgs<TVersion>
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
            return `/contexts/${id}/?${String(params)}`;
        }
    }
};
