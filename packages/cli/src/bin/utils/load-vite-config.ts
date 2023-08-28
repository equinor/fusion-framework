import { AssertionError } from 'node:assert';

import { Spinner } from './spinner.js';
import { formatPath, chalk } from './format.js';

import { createAppViteConfig, createViteConfig } from '../../lib/vite-config.js';
import { type ConfigExecuterEnv } from '../../lib/utils/config.js';
import { mergeConfig } from 'vite';

export const loadViteConfig = async (
    env: ConfigExecuterEnv,
    options?: {
        file?: string;
    },
) => {
    const spinner = Spinner.Current;
    try {
        spinner.start('load local vite configuration');
        const appViteConfig = await createAppViteConfig(env, {
            file: options?.file,
        });
        spinner.succeed();
        if (appViteConfig?.path) {
            spinner.info(`🛠️ ${formatPath(appViteConfig.path, { relative: true })}`);
        } else if (options?.file) {
            spinner.fail(`failed to load vite config from ${formatPath(options?.file)}`);
            throw new AssertionError({
                message: `Expected to load config from ${formatPath(options?.file)}`,
                expected: '<UserConfig>',
            });
        } else {
            spinner.info(
                chalk.dim(
                    `no local vite config applied, using built-in see ${formatPath(
                        'https://vitejs.dev/config/',
                    )}`,
                ),
            );
        }

        spinner.start('create vite configuration');
        const viteConfig = await createViteConfig(env);
        spinner.succeed();

        if (appViteConfig?.config) {
            return {
                viteConfig: mergeConfig(viteConfig, appViteConfig.config),
                path: appViteConfig.path,
            };
        } else {
            return { viteConfig };
        }
    } catch (err) {
        spinner.fail();
        throw err;
    }
};
