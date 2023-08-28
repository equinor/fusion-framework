import { Spinner } from './spinner.js';
import { formatPath, chalk } from './format.js';

import { createAppConfig, createAppConfigFromPackage } from '../../lib/app-config.js';
import { type ConfigExecuterEnv } from '../../lib/utils/config.js';
import { type ResolvedAppPackage } from '../../lib/app-package.js';

export const loadAppConfig = async (
    env: ConfigExecuterEnv,
    pkg: ResolvedAppPackage,
    options?: {
        file?: string;
    },
) => {
    const spinner = Spinner.Current;
    try {
        spinner.start('create application configuration');
        const baseAppConfig = createAppConfigFromPackage(pkg);
        const appConfig = await createAppConfig(env, baseAppConfig, { file: options?.file });
        spinner.succeed();
        if (appConfig.path) {
            spinner.info(
                `generating config from ${formatPath(appConfig.path, { relative: true })}`,
            );
        } else {
            spinner.info(chalk.dim('no local application config applied, using built-in'));
        }
        return appConfig;
    } catch (err) {
        spinner.fail(
            `failed to resolve application config ${
                options?.file ? formatPath(options?.file) : ''
            }`,
        );
        throw err;
    }
};

export default loadAppConfig;
