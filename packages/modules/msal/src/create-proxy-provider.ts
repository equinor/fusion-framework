import { MsalModuleVersion } from './static';
import semver, { SemVer } from 'semver';

import { IAuthProvider as AuthProvider_v2 } from './v2/provider';
import resolveVersion from './resolve-version';

type ProviderMap = {
    [MsalModuleVersion.V2]: AuthProvider_v2;
    [MsalModuleVersion.Latest]: AuthProvider_v2;
};

type ProviderType<T> = T extends keyof ProviderMap ? ProviderMap[T] : unknown;

interface SourceProvider {
    version: string;
}

interface createProxyProvider {
    /**
     * Creates an authentication provider based on the specified version.
     */
    (provider: SourceProvider, version: string): unknown;

    /**
     * Creates an authentication provider based on the specified version.
     */
    <TVersion extends keyof ProviderMap>(
        provider: SourceProvider,
        version: TVersion,
    ): ProviderMap[TVersion];

    /**
     * Creates an authentication provider from latest version.
     */
    (provider: SourceProvider): ProviderMap[typeof MsalModuleVersion.Latest];
}

/**
 * Creates an authentication provider based on the specified version.
 *
 * @template TVersion - The version type as a string.
 * @param {SourceProvider} provider - The authentication provider instance.
 * @param {TVersion} [version] - The version of the provider to create. Defaults to the latest version if not provided.
 * @returns {ProviderType<TVersion>} - The created provider of the specified version type.
 * @throws {Error} - Throws an error if the provided version is invalid, greater than the latest version, or not supported.
 */
export function createProxyProvider<TVersion extends string | SemVer>(
    provider: SourceProvider,
    version?: TVersion,
): ProviderType<TVersion> {
    const { wantedVersion, latestVersion, enumVersion } = resolveVersion(version as string);

    // check if version is valid semver version
    if (!wantedVersion) {
        throw new Error(`Invalid version ${version} provided`);
    }

    // check if version is greater than latest
    if (semver.gt(wantedVersion, latestVersion!)) {
        throw new Error(
            `Requested version ${version} is greater than the latest version ${MsalModuleVersion.Latest}`,
        );
    }

    // check if version is v2
    if (enumVersion === MsalModuleVersion.V2) {
        // create provider proxy to handle version specific methods
        return createProxyProvider_v2(provider) as ProviderType<TVersion>;
    }

    // check if version is latest, default to v2
    if (enumVersion === MsalModuleVersion.Latest) {
        return createProxyProvider(provider, MsalModuleVersion.V2) as ProviderType<TVersion>;
    }

    // version is not supported
    throw new Error(`Version ${version} is not supported`);
}

// TODO - generic interface with version
function createProxyProvider_v2(provider: SourceProvider): AuthProvider_v2 {
    const providerVersion = semver.coerce(provider.version);
    if (!providerVersion) {
        throw new Error('Invalid provider version');
    }
    // proxy was introduced in v4
    if (semver.satisfies(providerVersion, '<=4')) {
        return new Proxy(provider, {
            get: (target: AuthProvider_v2, prop) => {
                switch (prop) {
                    case 'version':
                        return target.version;
                    case 'defaultAccount':
                        return target.defaultAccount;
                    case 'acquireToken':
                        return target.acquireToken.bind(target);
                    case 'acquireAccessToken':
                        return target.acquireAccessToken.bind(target);
                    case 'login':
                        return target.login.bind(target);
                    case 'handleRedirect':
                        return target.handleRedirect.bind(target);
                }
                // throw new Error(`Property ${String(prop)} does not exist`);
            },
        }) as AuthProvider_v2;
    }
    throw new Error('Invalid provider version');
}

export default createProxyProvider;
