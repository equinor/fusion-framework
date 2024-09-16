import deepmerge from 'deepmerge';
import { execSync } from 'node:child_process';

import { AppPackageJson, ResolvedAppPackage, resolveEntryPoint } from './app-package.js';

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

export type AppManifestExport = {
    version: string;
    entryPoint: string;
    timestamp?: string;
    commitSha?: string;
    githubRepo?: string;
    projectPage?: string;
    annotations?: Record<string, string>;
    allowedExtensions?: string[];
};

export type AppManifestFn = (
    env: ConfigExecuterEnv,
    args: {
        base: AppManifestExport;
    },
) => AppManifestExport | Promise<AppManifestExport>;

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

export function assertAppManifest(value: AppManifestExport): asserts value {
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
    base: RecursivePartial<AppManifestExport>,
    overrides: RecursivePartial<AppManifestExport>,
): AppManifestExport => {
    const manifest = deepmerge(base, overrides) as unknown as AppManifestExport;
    assertAppManifest(manifest as unknown as AppManifestExport);
    return manifest;
};

/** loads manifestFn from file */
export const loadManifest = (filename?: string) =>
    loadConfig<AppManifestExport>(filename ?? manifestConfigFilename);

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

const getGithubRepo = (pkg: AppPackageJson) => {
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

const getGitCommitSha = () => {
    try {
        return execSync('git rev-parse HEAD').toString().trim();
    } catch {
        return undefined;
    }
};

export const createManifestFromPackage = (pkg: ResolvedAppPackage): AppManifestExport => {
    const { packageJson } = pkg;
    assertObject(packageJson, 'expected packageJson');
    assert(packageJson.name, 'expected [name] in packageJson');
    assert(packageJson.version, 'expected [version] in packageJson');
    const entryPoint = resolveEntryPoint(packageJson);
    const manifest = {
        version: packageJson.version,
        entryPoint,
        timestamp: new Date().toISOString(),
        githubRepo: getGithubRepo(packageJson),
        commitSha: getGitCommitSha(),
        projectPage: packageJson.homepage,
    } satisfies AppManifestExport;
    assertAppManifest(manifest);
    return manifest;
};

export const createManifest = async (
    env: ConfigExecuterEnv,
    base: AppManifestExport,
    options?: FindManifestOptions,
): Promise<{ manifest: AppManifestExport; path?: string }> => {
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
