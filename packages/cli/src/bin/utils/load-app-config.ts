import { Spinner } from './spinner.js';
import { formatPath, chalk } from './format.js';

import { createAppConfig } from '../../lib/app-config.js';
import { type ConfigExecuterEnv } from '../../lib/utils/config.js';
import { type ResolvedAppPackage } from '../../lib/app-package.js';
import { ApiAppConfig } from '@equinor/fusion-framework-module-app/schemas.js';

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
        spinner.info(
            `generating config with ${chalk.red.dim(env.command)} command in ${chalk.green.dim(env.mode)} mode`,
        );
        const baseAppConfig: ApiAppConfig = {} as ApiAppConfig;
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
