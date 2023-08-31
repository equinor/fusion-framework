import { Spinner } from './spinner.js';
import { formatPath, chalk } from './format.js';

import { createManifest, createManifestFromPackage } from '../../lib/app-manifest.js';
import { type ConfigExecuterEnv } from '../../lib/utils/config.js';
import { type ResolvedAppPackage } from '../../lib/app-package.js';

export const loadAppManifest = async (
    env: ConfigExecuterEnv,
    pkg: ResolvedAppPackage,
    options?: {
        file?: string;
    },
) => {
    const spinner = Spinner.Current;
    try {
        spinner.start('create application manifest');
        const baseManifest = await createManifestFromPackage(pkg);
        spinner.info('created application manifest from package.json');

        const manifest = await createManifest(env, baseManifest, { file: options?.file });
        spinner.succeed();

        if (manifest.path) {
            spinner.info(
                `generating manifest from ${formatPath(manifest.path, { relative: true })}`,
            );
        } else {
            spinner.info(chalk.dim('no local manifest config applied, using default generated'));
        }

        return manifest;
    } catch (err) {
        spinner.fail(
            `failed to resolve manifest ${options?.file ? formatPath(options?.file) : ''}`,
        );
        throw err;
    }
};

export default loadAppManifest;
