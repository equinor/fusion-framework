import deepmerge from 'deepmerge';

import { ResolvedAppPackage, resolveAppKey, resolveEntryPoint } from './app-package.js';

import {
    loadConfig,
    initiateConfig,
    resolveConfig,
    type FindConfigOptions,
    type ResolvedConfig,
    ConfigExecuterEnv,
} from './utils/config.js';

import { AssertionError, assert, assertObject } from './utils/assert.js';
import { RecursivePartial } from './utils/types.js';

export type AppManifest = {
    // version: {
    //     major: number;
    //     minor: number;
    //     patch: number;
    // };
    version: string;
    key: string;
    entry: string;
    name: string;
    shortName: string;
    description?: string;
    admins?: string[];
    owners?: string[];
    main?: string;
    icon?: string;
};

export type AppManifestFn = (
    env: ConfigExecuterEnv,
    args: {
        base: AppManifest;
    },
) => AppManifest | Promise<AppManifest>;

// export type AppManifestExport = AppManifest | AppManifestFn;

type FindManifestOptions = FindConfigOptions & {
    file?: string;
};

/** base filename for configuration files */
export const manifestConfigFilename = 'app.manifest';

/**
 * Define a manifest for an application
 *
 * @see {@link mergeManifests | extend manifest}
 *
 * @example
 * ```ts
 * export default defineAppManifest(async() => {
 *    // fetch some data, example owner from secrets
 *    const owner = gh.secrets.owners:
 *    return {
 *        ...all_required_attributes
 *        owners,
 *    }
 * })
 * ```
 * @param fnOrObj - defines the manifest as an object or callback
 */
export const defineAppManifest = (fn: AppManifestFn) => fn;

export function assertAppManifest(value: AppManifest): asserts value {
    assert(value, 'expected manifest');
    // TODO make assertions
}

// /**
//  * assert that the package version of the manifest is correct
//  *
//  * @TODO this should assert semver not .net syntax 🥺
//  */
// export function assertPackageVersion(value: AppManifest['version']): asserts value {
//     assertObjectEntries(value, {
//         props: ['major', 'minor', 'patch'],
//         assertion: (v, k): asserts v => assertNumber(v, `invalid value for version.${k}`),
//         preMessage: 'expected package version',
//     });
// }



/**
 * @example
 * ```ts
 * export default defineAppManifest(base) => mergeManifests(base, {prop: value});
 * ```
 * @param base base manifest to merge with
 * @param overrides target manifest to apply to base
 * @returns deep merged manifest
 */
export const mergeManifests = (
    base: RecursivePartial<AppManifest>,
    overrides: RecursivePartial<AppManifest>,
): AppManifest => {
    const manifest = deepmerge(base, overrides) as unknown as AppManifest;
    assertAppManifest(manifest as unknown as AppManifest);
    return manifest;
};

// // TODO  why do we do this??? can`t backend parse semver?
// export const parsePackageVersion = (manifest: AppManifest) => {
//     assert(manifest.version, 'expected version in AppManifest');
//     assert(manifest.version instanceof SemVer, 'expected version in AppManifest to be SemVer');
//     const { major, minor, patch } = manifest.version;
//     const version = { major, minor, patch };
//     return version;
// };

/** loads manifestFn from file */
export const loadManifest = (filename?: string) =>
    loadConfig<AppManifest>(filename ?? manifestConfigFilename);

/**
 * tries to resolve manifest
 * @see {@link resolveConfig | resolving config}
 */
export const resolveManifest = async (
    options?: FindConfigOptions & {
        file?: string;
    },
): Promise<ResolvedConfig<AppManifestFn> | void> => {
    if (options?.file) {
        const config = await loadManifest(options.file);
        return {
            config,
            path: options.file,
        };
    }
    return resolveConfig(manifestConfigFilename, { find: options });
};

export const createManifestFromPackage = (pkg: ResolvedAppPackage): AppManifest => {
    const { packageJson } = pkg;
    assertObject(packageJson, 'expected packageJson');
    assert(packageJson.name, 'expected [name] in packageJson');
    assert(packageJson.version, 'expected [version] in packageJson');
    const key = resolveAppKey(pkg.packageJson);
    const entry = resolveEntryPoint(pkg.packageJson);
    assert(entry, 'expected [version] in packageJson');

    const manifest = {
        key,
        entry,
        version: packageJson.version,
        // TODO manifest should not be loaded from package
        name: packageJson.manifest?.name ?? key,
        shortName: packageJson.manifest?.shortName ?? key,
        description: packageJson.description,
    } satisfies AppManifest;
    assertAppManifest(manifest);
    return manifest;
};

export const createManifest = async (
    env: ConfigExecuterEnv,
    base: AppManifest,
    options?: FindManifestOptions,
): Promise<{ manifest: AppManifest; path?: string }> => {
    const resolved = await resolveManifest(options);
    if (resolved) {
        const manifest = await initiateConfig(resolved.config, env, { base });
        assertAppManifest(manifest);
        return { manifest, path: resolved.path };
    } else if (options?.file) {
        throw new AssertionError({
            message: `Expected to load manifest from ${options.file}`,
            expected: '<manifest>',
        });
    }
    return { manifest: base };
};
