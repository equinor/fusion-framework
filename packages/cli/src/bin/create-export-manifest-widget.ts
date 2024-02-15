import nodeFs from 'node:fs';
import { writeFile } from 'node:fs/promises';
import assert from 'node:assert';

import { SemVer, parse as parseSemver } from 'semver';

import { chalk, formatPath } from './utils/format.js';
import { Spinner } from './utils/spinner.js';

import { loadWidgetManifest } from './utils/load-widget-manifest.js';

import { ConfigExecuterEnv } from '../lib/utils/config.js';
import { loadWidgetPackage } from './utils/load-widget-package.js';
import { dirname } from 'node:path';

import { WidgetManifest } from '../lib/widget-manifest.js';

// TODO  why do we do this??? can`t backend parse semver?
export const normalizeVersion = (version: string) => {
    const semverVersion = parseSemver(version);
    assert(semverVersion instanceof SemVer, 'expected version in AppManifest to be SemVer');

    const { major, minor, patch } = semverVersion;
    return { major, minor, patch };
};

const cleanManifest = (manifest: WidgetManifest): WidgetManifestExport => {
    return {
        name: manifest.name,
        description: manifest.description,
        version: normalizeVersion(manifest.version),
        entryPoint: manifest.entryPoint,
    };
};

type WidgetManifestExport = Omit<WidgetManifest, 'version' | 'id' | 'assetPath'> & {
    version: {
        major: number;
        minor: number;
        patch: number;
    };
};

export const createExportManifestWidget = async (options?: {
    command?: ConfigExecuterEnv['command'];
    configFile?: string;
    outputFile?: string;
}) => {
    const { command = 'build', outputFile } = options ?? {};

    const spinner = Spinner.Global({ prefixText: chalk.dim('manifest') });

    const pkg = await loadWidgetPackage();

    const env: ConfigExecuterEnv = {
        command,
        mode: process.env.NODE_ENV ?? 'development',
        root: pkg.root,
    };

    const { manifest } = await loadWidgetManifest(env, pkg, {
        file: options?.configFile,
    });

    const manifestExport: WidgetManifestExport = {
        ...cleanManifest(manifest),
    };

    if (outputFile) {
        spinner.start(`outputting manifest to ${formatPath(outputFile)}`);
        try {
            const dir = dirname(outputFile).trim();
            if (!nodeFs.existsSync(dirname(outputFile))) {
                nodeFs.mkdirSync(dir, { recursive: true });
            }
            await writeFile(outputFile, JSON.stringify(manifestExport));
            spinner.succeed();
        } catch (err) {
            spinner.fail();
            throw err;
        }
    } else {
        console.log(manifestExport);
    }
    return manifestExport;
};

export default createExportManifestWidget;
