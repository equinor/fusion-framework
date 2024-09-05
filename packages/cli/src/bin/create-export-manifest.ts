import nodeFs from 'node:fs';
import { writeFile } from 'node:fs/promises';
import assert from 'node:assert';
import { execSync } from 'node:child_process';

import { SemVer, parse as parseSemver } from 'semver';

import { chalk, formatPath } from './utils/format.js';
import { Spinner } from './utils/spinner.js';

import { loadAppManifest } from './utils/load-manifest.js';

import { ConfigExecuterEnv } from '../lib/utils/config.js';
import { loadPackage } from './utils/load-package.js';
import { dirname } from 'node:path';
import type { AppManifestExport } from '../lib/app-manifest.js';

// TODO  why do we do this??? can`t backend parse semver?
export const normalizeVersion = (version: string) => {
    const semverVersion = parseSemver(version);
    assert(semverVersion instanceof SemVer, 'expected version in AppManifest to be SemVer');

    const { major, minor, patch } = semverVersion;
    return { major, minor, patch };
};

export const createExportManifest = async (options?: {
    command?: ConfigExecuterEnv['command'];
    configFile?: string;
    outputFile?: string;
}): Promise<AppManifestExport> => {
    const { command = 'build', outputFile } = options ?? {};

    const spinner = Spinner.Global({ prefixText: chalk.dim('manifest') });

    const pkg = await loadPackage();

    const env: ConfigExecuterEnv = {
        command,
        mode: process.env.NODE_ENV ?? 'development',
        root: pkg.root,
    };

    const { manifest } = await loadAppManifest(env, pkg, {
        file: options?.configFile,
    });

    if (outputFile) {
        spinner.start(`outputting manifest to ${formatPath(outputFile)}`);
        try {
            const dir = dirname(outputFile).trim();
            if (!nodeFs.existsSync(dirname(outputFile))) {
                nodeFs.mkdirSync(dir, { recursive: true });
            }
            await writeFile(outputFile, JSON.stringify(manifest));
            spinner.succeed();
        } catch (err) {
            spinner.fail();
            throw err;
        }
    } else {
        console.log(manifest);
    }
    return manifest;
};

export default createExportManifest;
