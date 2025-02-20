import { Spinner } from './spinner.js';
import { formatPath, chalk } from './format.js';

import { createManifest, createManifestFromPackage } from '../../lib/app-manifest.js';

import type { AppManifest } from '@equinor/fusion-framework-module-app';

import { type ConfigExecuterEnv } from '../../lib/utils/config.js';
import { type ResolvedAppPackage } from '../../lib/app-package.js';

export const loadAppManifest = async (
  env: ConfigExecuterEnv,
  pkg: ResolvedAppPackage,
  options?: {
    file?: string;
  },
): Promise<{ manifest: AppManifest; path?: string }> => {
  const spinner = Spinner.Clone();
  try {
    spinner.start('create application manifest');
    const baseManifest = await createManifestFromPackage(pkg);
    spinner.info('created application manifest from package.json');

    // TODO - this need to come from the config
    if (env.command !== 'serve') {
      baseManifest.build!.entryPoint =
        pkg.packageJson.type === 'module' ? 'app-bundle.js' : 'app-bundle.mjs';
    }

    spinner.info(
      `generating manifest with ${chalk.red.dim(env.command)} command in ${chalk.green.dim(env.mode)} mode`,
    );

    const manifest = await createManifest(env, baseManifest, { file: options?.file });

    if (manifest.path) {
      spinner.succeed(`Created manifest from ${formatPath(manifest.path, { relative: true })}`);
    } else {
      spinner.succeed(chalk.dim('no local manifest config applied, using default generated'));
    }

    return manifest;
  } catch (err) {
    spinner.fail(`failed to resolve manifest ${options?.file ? formatPath(options?.file) : ''}`);
    throw err;
  }
};

export default loadAppManifest;
