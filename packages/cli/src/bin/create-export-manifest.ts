import nodeFs from 'node:fs';
import { writeFile } from 'node:fs/promises';
import assert from 'node:assert';

import { SemVer, parse as parseSemver } from 'semver';

import { chalk, formatPath } from './utils/format.js';
import { Spinner } from './utils/spinner.js';

import { loadAppManifest } from './utils/load-manifest.js';

import type { ConfigExecuterEnv } from '../lib/utils/config.js';
import { loadPackage } from './utils/load-package.js';
import { dirname } from 'node:path';
import type { AppManifest } from '@equinor/fusion-framework-module-app';

// TODO  why do we do this??? can`t backend parse semver?
export const normalizeVersion = (version: string) => {
  const semverVersion = parseSemver(version);
  assert(semverVersion instanceof SemVer, 'expected version in AppManifest to be SemVer');

  const { major, minor, patch } = semverVersion;
  return { major, minor, patch };
};

type CreateManifestOptions = {
  command?: ConfigExecuterEnv['command'];
  configFile?: string;
  outputFile?: string;
  onlyBuild?: boolean;
};

export const createAppManifest = async (options?: CreateManifestOptions) => {
  Spinner.Global({ prefixText: chalk.dim('app manifest') });
  const manifest = await createManifest(options);
  if (options?.outputFile) {
    await writeManifestToDisk(manifest, options.outputFile);
  } else {
    console.log(JSON.stringify(manifest, undefined, 2));
  }
  return manifest;
};

export const createBuildManifest = async (options?: CreateManifestOptions) => {
  Spinner.Global({ prefixText: chalk.dim('build manifest') });
  const { build } = await createManifest(options);
  if (options?.outputFile) {
    await writeManifestToDisk(build, options.outputFile);
  } else {
    console.log(JSON.stringify(build, undefined, 2));
  }
  return build;
};

const writeManifestToDisk = async (
  content: AppManifest | AppManifest['build'],
  outputFile: string,
): Promise<void> => {
  const spinner = Spinner.Clone();
  spinner.start(`Exporting manifest to ${formatPath(outputFile)}`);
  try {
    const dir = dirname(outputFile).trim();
    if (!nodeFs.existsSync(dirname(outputFile))) {
      nodeFs.mkdirSync(dir, { recursive: true });
    }
    await writeFile(outputFile, JSON.stringify(content));
    spinner.succeed();
  } catch (err) {
    spinner.fail();
    throw err;
  }
};

const createManifest = async (options?: CreateManifestOptions): Promise<AppManifest> => {
  const pkg = await loadPackage();

  const env: ConfigExecuterEnv = {
    command: options?.command ?? 'build',
    mode: process.env.NODE_ENV ?? 'development',
    root: pkg.root,
  };

  const { manifest } = await loadAppManifest(env, pkg, {
    file: options?.configFile,
  });

  return manifest;
};
