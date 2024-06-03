import { extractVersion as extractVersionBase } from '../utils';

import { ApiVersion } from './static';

import type { ExtractApiVersion, FilterAllowedApiVersions } from './types';

export const extractApiVersion = <
    TAllowedApiVersion extends FilterAllowedApiVersions,
    TVersion extends FilterAllowedApiVersions = FilterAllowedApiVersions,
>(
    version: TVersion,
): ExtractApiVersion<TVersion, TAllowedApiVersion> => {
    return extractVersionBase(ApiVersion, version);
};
