import { ApiVersion } from '../static';

import type { GetContextArgs } from './types';

export const generateEndpoint = <TVersion extends ApiVersion>(
    version: TVersion,
    args: GetContextArgs<TVersion>
) => {
    switch (version) {
        case ApiVersion.v1:
        case ApiVersion.v2: {
            const { id } = args;
            const params = new URLSearchParams();
            params.append('api-version', version);
            return `/contexts/${id}${String(params)}`;
        }
    }
    throw Error(`no query function configured for version [${version}]`);
};

export default generateEndpoint;
