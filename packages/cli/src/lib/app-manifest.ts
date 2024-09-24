import deepMerge from 'deepmerge';
import { execSync } from 'node:child_process';

import {
    AppPackageJson,
    resolveAppKey,
    ResolvedAppPackage,
    resolveEntryPoint,
} from './app-package.js';

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
import { AppManifest } from '@equinor/fusion-framework-module-app';
import { parse as parseSemver } from 'semver';

export type AppManifestFn = (
    env: ConfigExecuterEnv,
    args: {
        base: AppManifest;
    },
) => AppManifest | Promise<AppManifest | void> | void;

type FindManifestOptions = FindConfigOptions & {
    file?: string;
};

/** base filename for configuration files */
export const manifestConfigFilename = 'app.manifest.config';

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
    assert(value.build, 'expected build');
    assert(parseSemver(value.build?.version), 'invalid version');
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
    const manifest = deepMerge(base, overrides) as AppManifest;
    assertAppManifest(manifest);
    return manifest;
};

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
    return resolveConfig<AppManifest>(manifestConfigFilename, { find: options });
};

const resolveGithubRepo = (pkg: AppPackageJson) => {
    try {
        /* get reporurl from package.json */
        if (pkg.repository) {
            return typeof pkg.repository === 'string' ? pkg.repository : pkg.repository.url;
        } else {
            /* get reporurl from git command */
            return execSync('git remote get-url origin')
                .toString()
                .trim()
                .replace('git@github.com:', 'https://github.com/')
                .replace(/.git$/, '');
        }
    } catch {
        return undefined;
    }
};

const resolveGitCommitSha = () => {
    try {
        return execSync('git rev-parse HEAD').toString().trim();
    } catch {
        return undefined;
    }
};

export const createManifestFromPackage = (pkg: ResolvedAppPackage): AppManifest => {
    const { packageJson } = pkg;
    assertObject(packageJson, 'expected packageJson');
    assert(packageJson.name, 'expected [name] in packageJson');
    assert(packageJson.version, 'expected [version] in packageJson');
    const entryPoint = resolveEntryPoint(packageJson);
    const manifest: AppManifest = {
        appKey: resolveAppKey(pkg.packageJson),
        displayName: packageJson.name,
        description: packageJson.description || '',
        keywords: packageJson.keywords,
        type: 'standalone',
        build: {
            entryPoint,
            version: packageJson.version,
            timestamp: new Date().toISOString(),
            githubRepo: resolveGithubRepo(packageJson),
            commitSha: resolveGitCommitSha(),
            projectPage: packageJson.homepage,
        },
    };
    return manifest;
};

export const createManifest = async (
    env: ConfigExecuterEnv,
    base: AppManifest,
    options?: FindManifestOptions,
): Promise<{ manifest: AppManifest; path?: string }> => {
    const resolved = await resolveManifest(options);
    if (resolved) {
        const configuredManifest = await initiateConfig(resolved.config, env, { base });
        const manifest = deepMerge(base, configuredManifest ?? {}) as AppManifest;
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
