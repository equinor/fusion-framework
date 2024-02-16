import { Spinner } from './spinner.js';
import { formatPath, chalk } from './format.js';

import {
    createWidgetManifest,
    createWidgetManifestFromPackage,
} from '../../lib/widget-manifest.js';
import { type ConfigExecuterEnv } from '../../lib/utils/config.js';
import { ResolvedWidgetPackage } from '../../lib/widget-package.js';

export const loadWidgetManifest = async (
    env: ConfigExecuterEnv,
    pkg: ResolvedWidgetPackage,
    options?: {
        file?: string;
    },
) => {
    const spinner = Spinner.Current;
    try {
        spinner.start('create widget manifest');
        const baseManifest = createWidgetManifestFromPackage(pkg);
        const manifest = await createWidgetManifest(env, baseManifest, {
            file: options?.file,
        });
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
