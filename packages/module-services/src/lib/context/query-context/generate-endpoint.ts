import { ApiVersion } from '../static';

import type { QueryContextArgs } from './types';

export const generateEndpoint = <TVersion extends ApiVersion>(
    version: TVersion,
    args: QueryContextArgs<TVersion>
) => {
    switch (version) {
        case ApiVersion.v1:
        case ApiVersion.v2: {
            const { query } = args;
            const params = new URLSearchParams();
            params.append('api-version', version);
            params.append('$filter', query.filter);
            if (query.includeDeleted) {
                params.append('includeDeleted', 'true');
            }
            if (query.expand) {
                params.append('$expand', query.expand.join(','));
            }
            return `/contexts/?${String(params)}`;
        }
    }
    throw Error(`no query function configured for version [${version}]`);
};

export default generateEndpoint;
