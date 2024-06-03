import { ExtractApiVersion } from './types';

export const extractVersion = <
    TApiVersions extends Record<string, string>,
    TAllowedApiVersion extends string,
    TVersion extends string,
>(
    apiVersions: TApiVersions,
    version: TVersion,
): ExtractApiVersion<TApiVersions, TVersion, TAllowedApiVersion> => {
    if (version in apiVersions) {
        return version as ExtractApiVersion<TApiVersions, TVersion, TAllowedApiVersion>;
    }
    const extractedVersion = Object.values(apiVersions).find((v) => v === version);
    if (!extractedVersion) {
        throw new Error(`Version ${version} is not supported`);
    }
    return extractedVersion as ExtractApiVersion<TApiVersions, TVersion, TAllowedApiVersion>;
};
