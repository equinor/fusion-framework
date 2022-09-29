import { ApiVersion } from '../static';

import type { GetContextArgs } from './types';

export const generateEndpoint = <TVersion extends string = keyof typeof ApiVersion>(
    version: TVersion,
    args: GetContextArgs<TVersion>
) => {
    const apiVersion = ApiVersion[version as keyof typeof ApiVersion] ?? version;
    switch (version) {
        case ApiVersion.v1:
        case ApiVersion.v2:
        default: {
            const { id } = args as { id: string };
            const params = new URLSearchParams();
            params.append('api-version', apiVersion);
            return `/contexts/${id}/?${String(params)}`;
        }
    }
};
